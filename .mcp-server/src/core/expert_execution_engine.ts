import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {
    DefaultExpert,
    KnowledgeBaseExpert,
    PlanningExpert,
    ResultSynthesizingExpert,
    RuleBasedExpert,
    type AbstractExpertParams,
} from '../experts';
import {FlexionCodeExpert} from '../experts/flexion_code_expert';
import type {
    Expert,
    ExpertContext,
    ExpertOutput,
    ExpertPlan,
    Message,
    PlanIndices,
} from '../types';
import {ExpertName, Tool} from '../types';
import {error, expertRegistry, log} from '../utils';

interface EngineResponse {
    messages?: Message[];
    type: ExpertOutput['type'];
    systemPrompt?: string;
    action?: string;
}

export interface EngineResponseExecutionPlan extends EngineResponse {
    prev_plan_index?: number;
    now_plan_index?: number;
    next_plan_index?: number;
    last_plan_index?: number;
    now_expert?: ExpertName;
    note?: string;
}

// 엔진 상태 머신의 상태들을 정의합니다.
export const enum EngineState {
    BOOTING = 'BOOTING',
    IDLE = 'IDLE',
    PLANNING = 'PLANNING',
    WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
    EXECUTING = 'EXECUTING',
    AWATING_HOST_LLM_RESPONSE = 'AWATING_HOST_LLM_RESPONSE',
    FAILED = 'FAILED',
}

type ToolFunction = (params: any) => Promise<any>;

export class ExpertExecutionEngine {
    private state: EngineState = EngineState.BOOTING;
    private toolRegistry: Map<string, ToolFunction> = new Map();
    private expertContext: ExpertContext = {
        userRequest: '',
        workspacePath: '',
    };
    private server: Server;
    private readonly componentName = 'ExpertExecutionEngine';
    private expertPlans: ExpertPlan[] = [];
    private planIndices: PlanIndices = {prev: -1, now: 0, next: 0, last: -1};

    // 활성 전문가 및 내부 계획 상태
    private activeExpert: Expert | null = null;

    private isUserExplicitlyCalledTool: boolean = false;

    public getIsUserExplicitlyCalledTool() {
        return this.isUserExplicitlyCalledTool;
    }
    public setIsUserExplicitlyCalledTool(value: boolean) {
        this.isUserExplicitlyCalledTool = value;
    }

    constructor(server: Server) {
        this.server = server;
        this.registerCoreTools();
        this.registerExperts();
        this.resetEngine();
    }

    public getPlanState() {
        return {
            plans: this.expertPlans,
            indices: this.planIndices,
        };
    }

    public async generatePlanningPrompt(
        userRequest: string,
    ): Promise<EngineResponse> {
        if (this.state !== EngineState.IDLE) {
            throw new Error(
                `현재 상태(${this.state})에서는 새로운 요청을 처리할 수 없습니다. 사용자에게 현재계획 취소를 요청해야 합니다.`,
            );
        }
        this.expertContext = {
            userRequest: userRequest,
            workspacePath: process.cwd(),
        };

        const planningExpert = expertRegistry.get(
            ExpertName.Planning,
        ) as Expert;
        const expertOutput = await planningExpert.run(this.expertContext, {
            type: 'planning',
            topic: 'Initial plan from user request',
            content: userRequest,
            status: 'pending',
        });

        if (expertOutput?.type === 'execution_plan') {
            // this.expertPlans = expertOutput.plans;
            // this.planIndices = {
            //     prev: -1,
            //     now: 0,
            //     next: this.expertPlans.length > 1 ? 1 : 0,
            //     last:
            //         this.expertPlans.length > 0
            //             ? this.expertPlans.length - 1
            //             : -1,
            // };
            this.setEngineState(
                EngineState.PLANNING,
                'host llm 에게 계획 프롬프트를 전달합니다',
            );
            return {
                messages: expertOutput.messages,
                type: 'execution_plan',
                // systemPrompt: expertOutput.systemPrompt,
            };
        } else {
            const errorMessage = `내부 오류: PlanningExpert가 LlmRequest를 반환하지 않았습니다.`;
            error(this.componentName, errorMessage);
            this.setEngineState(
                EngineState.FAILED,
                '계획 수립 중 예기치 않은 응답',
            );
            throw new Error(errorMessage);
        }
    }

    // 이 메소드는 사용자 승인 후  호출됩니다.
    public async executeNextPlan(): Promise<EngineResponseExecutionPlan> {
        if (this.activeExpert) {
            log(
                this.componentName,
                `활성 전문가(${this.activeExpert.name})의 내부 계획이 진행 중입니다. Host LLM에게 내부 계획 실행을 요청합니다.`,
            );
            return {
                type: 'info',
                action: 'execute_next_internal_plan',
                messages: [
                    {
                        role: 'system',
                        content: {
                            type: 'text',
                            text: `현재 활성 전문가(${this.activeExpert.name})의 내부 계획을 실행해야 합니다. \`execute_next_internal_plan\` 도구를 호출하여 다음 단계를 진행하세요.`,
                        },
                    },
                ],
                note: 'Delegate to internal plan execution',
            };
        }

        if (!this.expertPlans) {
            const errorMessage = '실행할 계획이 존재하지 않습니다.';
            this.setEngineState(EngineState.FAILED, errorMessage);
            throw new Error(errorMessage);
        }
        if (this.state === EngineState.WAITING_FOR_APPROVAL) {
            const errorMessage = `현재 상태(${this.state})에서는 계획을 실행할 수 없습니다. 사용자의 승인을 기다리고 있습니다.`;
            throw new Error(errorMessage);
        }

        this.setEngineState(EngineState.EXECUTING, '계획을 실행합니다.');

        const now_plan_index = this.planIndices.now;

        log(
            this.componentName,
            `now_plan_index: ${now_plan_index}, last: ${this.planIndices.last}, expertPlans.length: ${this.expertPlans.length}`,
        );
        if (now_plan_index > this.planIndices.last) {
            this.setEngineState(
                EngineState.IDLE,
                '실행이 완료되었습니다. 엔진을 초기화합니다.',
            );
            return {
                type: 'info',
                messages: [
                    {
                        role: 'system',
                        content: {
                            type: 'text',
                            text: '모든 계획이 완료되었습니다.',
                        },
                    },
                ],
                note: 'All plans executed',
            };
        } else if (now_plan_index < this.expertPlans.length) {
            const step = this.expertPlans[now_plan_index];
            step.task.status = 'in_progress';
            const expert = expertRegistry.get(step.expert);

            if (expert) {
                const expertOutput = await expert.run(
                    this.expertContext,
                    step.task,
                );
                log(
                    this.componentName,
                    `expertOutput: ${JSON.stringify(expertOutput)}`,
                );

                // 전문가가 내부 계획 실행을 시작했는지 확인
                if (
                    'isExecutingInternalPlan' in expert &&
                    expert.isExecutingInternalPlan
                ) {
                    this.activeExpert = expert;
                    log(
                        this.componentName,
                        `전문가(${this.activeExpert.name})가 활성 상태로 전환되어 내부 계획 실행을 시작합니다.`,
                    );
                    // Host LLM에게 내부 계획 실행 시작을 알림
                    return {
                        type: 'info',
                        action: 'execute_next_internal_plan',
                        messages: [
                            {
                                role: 'system',
                                content: {
                                    type: 'text',
                                    text: `전문가(${this.activeExpert.name})가 내부 계획 실행을 시작했습니다. \`execute_next_internal_plan\` 도구를 호출하여 첫 번째 단계를 진행하세요.`,
                                },
                            },
                        ],
                        note: 'Internal plan execution started.',
                    };
                }

                if (expertOutput.type === 'execution_plan') {
                    this.setEngineState(
                        EngineState.AWATING_HOST_LLM_RESPONSE,
                        `Waiting for LLM response for expert: ${step.expert}`,
                    );
                    return {
                        ...expertOutput,
                        prev_plan_index: this.planIndices.prev,
                        now_plan_index: this.planIndices.now,
                        next_plan_index: this.planIndices.now + 1,
                        now_expert: step.expert,
                        action: 'complete_and_advance_plan',
                        note: `now_plan_index === ${
                            this.expertPlans.length - 1
                        } 이면 남은 계획이 없다는 의미입니다.`,
                    };
                }
            } else {
                this.setEngineState(
                    EngineState.FAILED,
                    `전문가 '${step.expert}'를 찾을 수 없습니다.`,
                );
                throw new Error(
                    `오류: 전문가 '${step.expert}'를 찾을 수 없습니다.`,
                );
            }
        }

        return {
            type: 'info',
            messages: [
                {
                    role: 'system',
                    content: {
                        type: 'text',
                        text: `모든 계획의 수행이 완료되었습니다. 정보--> now_plan_index: ${now_plan_index}, last_plan_index: ${this.planIndices.last}, expertPlans.length: ${this.expertPlans.length}`,
                    },
                },
            ],
        };
    }

    // public async executeNextInternalPlan(): Promise<EngineResponseExecutionPlan> {
    //     if (!this.activeExpert) {
    //         const errorMessage =
    //             '내부 계획을 실행할 활성 전문가가 지정되지 않았습니다.';
    //         this.setEngineState(EngineState.FAILED, errorMessage);
    //         throw new Error(errorMessage);
    //     }

    //     log(
    //         this.componentName,
    //         `활성 전문가(${this.activeExpert.name})의 다음 내부 계획을 실행합니다.`,
    //     );

    //     const expertOutput = await this.activeExpert.runNextInternalPlan(
    //         this.expertContext,
    //     );

    //     // 내부 계획이 모두 완료되었는지 확인
    //     if (
    //         'isInternalPlanCompleted' in this.activeExpert &&
    //         this.activeExpert.isInternalPlanCompleted()
    //     ) {
    //         log(
    //             this.componentName,
    //             `활성 전문가(${this.activeExpert.name})의 내부 계획이 모두 완료되었습니다.`,
    //         );
    //         const completedExpertName = this.activeExpert.name;
    //         this.activeExpert = null; // 활성 전문가 비활성화

    //         return {
    //             ...expertOutput,
    //             action: 'complete_and_advance_plan', // 상위 계획 계속 진행
    //             note: `Internal plan of ${completedExpertName} completed. Resuming main plan.`,
    //         };
    //     } else {
    //         // 내부 계획이 아직 남아있음
    //         return {
    //             ...expertOutput,
    //             action: 'execute_next_internal_plan', // 다음 내부 계획 계속 진행
    //             note: `Continuing internal plan of ${this.activeExpert.name}.`,
    //         };
    //     }
    // }

    public async completeAndAdvancePlan(): Promise<{
        success: boolean;
        indices: PlanIndices;
        message?: string;
    }> {
        const now_plan_index = this.planIndices.now;
        if (now_plan_index > this.planIndices.last) {
            return {
                success: false,
                indices: this.planIndices,
                message: 'No more plans to complete.',
            };
        }

        if (this.expertPlans[now_plan_index]) {
            this.expertPlans[now_plan_index].task.status = 'completed';
        }

        this.planIndices.prev = now_plan_index;
        this.planIndices.now = now_plan_index + 1;
        this.planIndices.next = now_plan_index + 2;

        if (this.planIndices.now > this.planIndices.last) {
            this.setEngineState(
                EngineState.IDLE,
                '마지막 계획 실행이 완료되었습니다. 엔진을 초기화합니다.',
            );
        }

        log(
            this.componentName,
            `Plan step ${now_plan_index} completed. Indices advanced.`,
        );

        return {success: true, indices: this.planIndices};
    }

    public async insertPlanSteps(
        newPlans: ExpertPlan[],
        index?: number,
        type: 'insert' = 'insert',
    ): Promise<{success: boolean; message?: string}> {
        if (type === 'insert') {
            if (!index) {
                this.expertPlans.push(...newPlans);
            } else if (index < 0 || index > this.expertPlans.length) {
                return {
                    success: false,
                    message: `Invalid index ${index}. Index must be between 0 and ${this.expertPlans.length}.`,
                };
            } else {
                this.expertPlans.splice(index, 0, ...newPlans);
            }
            this.planIndices.last = this.expertPlans.length - 1;
            log(
                this.componentName,
                `Plan updated: inserted ${newPlans.length} tasks at index ${index}`,
            );
            return {success: true};
        }
        // TODO: Implement other update types like 'replace' or 'delete'
        return {
            success: false,
            message: `Update type '${type}' not supported.`,
        };
    }

    public async replan(userRequest: string): Promise<EngineResponse> {
        this.setEngineState(EngineState.IDLE, '재계획을 시작합니다.');
        return this.generatePlanningPrompt(userRequest);
    }

    private registerExperts() {
        const abstractExpertParams: AbstractExpertParams = {
            server: this.server,
        };
        expertRegistry.set(
            ExpertName.Planning,
            new PlanningExpert(abstractExpertParams),
        );
        expertRegistry.set(
            ExpertName.KnowledgeBase,
            new KnowledgeBaseExpert(abstractExpertParams),
        );
        expertRegistry.set(
            ExpertName.ResultSynthesizing,
            new ResultSynthesizingExpert(abstractExpertParams),
        );
        expertRegistry.set(
            ExpertName.Default,
            new DefaultExpert(abstractExpertParams),
        );
        expertRegistry.set(
            ExpertName.FlexionCode,
            new FlexionCodeExpert(abstractExpertParams),
        );
        // expertRegistry.set(
        //     ExpertName.RuleBased,
        //     new RuleBasedExpert(abstractExpertParams),
        // );
    }

    private registerCoreTools() {
        this.toolRegistry.set(Tool.ReadFile, async (params: {path: string}) => {
            log(this.componentName, `[도구:${Tool.ReadFile}] 파일 읽기`, {
                path: params.path,
            });
            return `{"content": "${params.path}의 더미 콘텐츠"}`;
        });

        this.toolRegistry.set(
            Tool.LogMessage,
            async (params: {message: string}) => {
                log(this.componentName, `[도구:${Tool.LogMessage}]`, {
                    message: params.message,
                });
                return '메시지가 기록되었습니다.';
            },
        );
    }

    private setEngineState(state: EngineState, message: string) {
        this.state = state;
        log(this.componentName, `엔진 상태가 ${state}로 변경되었습니다.`, {
            message,
        });
    }

    public async resetEngine({
        user_request,
    }: {
        user_request?: string;
    } = {}): Promise<EngineResponse> {
        this.expertContext = {
            userRequest: user_request ?? '',
            workspacePath: process.cwd(),
        };
        this.expertPlans = [];
        this.planIndices = {prev: -1, now: 0, next: 0, last: -1};
        this.activeExpert = null;
        this.setEngineState(EngineState.IDLE, '엔진이 초기화되었습니다.');
        this.setIsUserExplicitlyCalledTool(false);
        return {
            type: 'info',
            messages: [
                {
                    role: 'system',
                    content: {
                        type: 'text',
                        text: '엔진이 초기화되었습니다. now_plan_index는 0 입니다.',
                    },
                },
            ],
        };
    }
}
