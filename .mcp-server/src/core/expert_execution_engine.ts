import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { ExpertContext, Message, ExpertOutputType, ExpertPlans, Expert } from '../types';
import { ExpertName, Tool } from '../types';
import {
	ResultSynthesizingExpert,
	DefaultExpert,
	KnowledgeBaseExpert,
	PlanningExpert,
	type AbstractExpertParams,
} from '../experts';
import { log, error, expertRegistry } from '../utils';
import { FlexionCodeExpert } from '../experts/flexion_code_expert';

interface EngineResponse {
	messages: Message[];
	type: ExpertOutputType;
	systemPrompt?: string;
	action?: string;
	plan?: ExpertPlans;
	plan_index?: number;
	last_plan_index?: number;
	error?: string;
	[key: string]: unknown;
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

// const expertTaskTypes = {
// 	[ExpertName.Planning]: ['planning'],
// 	[ExpertName.KnowledgeBase]: ['retrieve', 'save'],
// 	[ExpertName.ResultSynthesizing]: ['synthesize'],
// 	[ExpertName.Default]: ['default'],
// 	[ExpertName.FlexionCode]: ['analyze', 'planning', 'retrieve', 'save'],
// };

export class ExpertExecutionEngine {
	private state: EngineState = EngineState.BOOTING;
	private toolRegistry: Map<string, ToolFunction> = new Map();
	// private expertRegistry: ExpertRegistry = new ExpertRegistry();
	private expertContext: ExpertContext = {
		available_host_tools: [],
		user_request: '',
	};
	private server: Server;
	private readonly componentName = 'ExpertExecutionEngine';

	constructor(server: Server) {
		this.server = server;
		this.registerCoreTools();
		this.registerExperts();
		this.resetEngine();
	}

	public async processRequest(userRequest: string, availableHostTools: string[]): Promise<EngineResponse> {
		if (this.state !== EngineState.IDLE) {
			return {
				messages: [],
				type: 'error',
				error: `현재 상태(${this.state})에서는 새로운 요청을 처리할 수 없습니다.`,
			};
		}
		this.expertContext = {
			available_host_tools: availableHostTools,
			user_request: userRequest,
		};

		const planningExpert = expertRegistry.get(ExpertName.Planning) as Expert;
		const expertOutput = await planningExpert.execute(this.expertContext, userRequest);

		if (expertOutput?.type === 'llm_request') {
			this.setEngineState(EngineState.PLANNING, 'host llm 에게 계획 프롬프트를 전달합니다');
			return expertOutput;
		} else {
			error(this.componentName, 'PlanningExpert가 LlmRequest를 반환하지 않았습니다.');
			this.setEngineState(EngineState.FAILED, '계획 수립 중 예기치 않은 응답');
			return {
				messages: [],
				type: 'error',
				error: '내부 오류: 계획 수립 중 예기치 않은 응답',
			};
		}
	}

	// 이 메소드는 사용자 승인 후  호출됩니다.
	public async executeNextPlan(
		expertPlans: ExpertPlans,
		prev_plan_index: number,
		now_plan_index: number,
		next_plan_index: number,
		last_plan_index: number
	): Promise<EngineResponse> {
		if (!expertPlans) {
			this.setEngineState(EngineState.FAILED, '실행할 계획이 존재하지 않습니다.');
			return {
				messages: [],
				type: 'error',
				error: '오류: 실행할 계획이 존재하지 않습니다.',
			};
		}
		if (this.state === EngineState.WAITING_FOR_APPROVAL) {
			return {
				messages: [],
				type: 'error',
				error: `현재 상태(${this.state})에서는 계획을 실행할 수 없습니다. 사용자의 승인을 기다리고 있습니다.`,
			};
		}

		this.setEngineState(EngineState.EXECUTING, '계획을 실행합니다.');

		if (now_plan_index < 0) {
			now_plan_index = 0;
		}
		if (now_plan_index < expertPlans.length) {
			log(this.componentName, `계획 실행 중: ${now_plan_index}`, { expertPlans });
			const step = expertPlans[now_plan_index];
			const expert = expertRegistry.get(step.expert);

			if (expert) {
				log(this.componentName, `전문가 실행 중: ${step.expert}`, { step: now_plan_index, task: step.task });
				const expertOutput = await expert.execute(this.expertContext, step.task);

				if (expertOutput.type === 'llm_request') {
					this.setEngineState(
						EngineState.AWATING_HOST_LLM_RESPONSE,
						`Waiting for LLM response for expert: ${step.expert}`
					);
					return {
						...expertOutput,
						prev_plan_index: now_plan_index - 1 < 0 ? undefined : now_plan_index - 1,
						now_plan_index: now_plan_index,
						next_plan_index: now_plan_index + 1 < expertPlans.length ? now_plan_index + 1 : now_plan_index,
						last_plan_index: expertPlans.length - 1,
						now_expert: step.expert,
						action: 'execute_next_plan',
						note: `now_plan_index === ${expertPlans.length - 1} 이면 남은 계획이 없다는 의미입니다.`,
					};
				}

				this.expertContext = {
					available_host_tools: this.expertContext.available_host_tools,
					user_request: this.expertContext.user_request,
				};
			} else {
				this.setEngineState(EngineState.FAILED, `전문가 '${step.expert}'를 찾을 수 없습니다.`);
				return {
					messages: [],
					type: 'error',
					error: `오류: 전문가 '${step.expert}'를 찾을 수 없습니다.`,
				};
			}
		}

		this.setEngineState(EngineState.IDLE, '실행이 완료되었습니다. 엔진을 초기화합니다.');

		return {
			type: 'info',
			messages: [
				{
					role: 'system',
					content: { type: 'text', text: '계획이 성공적으로 실행되었습니다. 엔진을 초기화합니다.' },
				},
			],
		};
	}

	public async replan(userRequest: string, availableHostTools: string[]): Promise<EngineResponse> {
		if (this.state !== EngineState.WAITING_FOR_APPROVAL) {
			return {
				messages: [],
				type: 'error',
				error: `현재 상태(${this.state})에서는 재계획을 할 수 없습니다.`,
			};
		}
		return this.processRequest(userRequest, availableHostTools);
	}

	private registerExperts() {
		const abstractExpertParams: AbstractExpertParams = {
			server: this.server,
		};
		expertRegistry.set(ExpertName.Planning, new PlanningExpert(abstractExpertParams));
		expertRegistry.set(ExpertName.KnowledgeBase, new KnowledgeBaseExpert(abstractExpertParams));
		expertRegistry.set(ExpertName.ResultSynthesizing, new ResultSynthesizingExpert(abstractExpertParams));
		expertRegistry.set(ExpertName.Default, new DefaultExpert(abstractExpertParams));
		expertRegistry.set(ExpertName.FlexionCode, new FlexionCodeExpert(abstractExpertParams));
	}

	private registerCoreTools() {
		this.toolRegistry.set(Tool.ReadFile, async (params: { path: string }) => {
			log(this.componentName, `[도구:${Tool.ReadFile}] 파일 읽기`, { path: params.path });
			return `{"content": "${params.path}의 더미 콘텐츠"}`;
		});

		this.toolRegistry.set(Tool.LogMessage, async (params: { message: string }) => {
			log(this.componentName, `[도구:${Tool.LogMessage}]`, { message: params.message });
			return '메시지가 기록되었습니다.';
		});
	}

	private setEngineState(state: EngineState, message: string) {
		this.state = state;
		log(this.componentName, `엔진 상태가 ${state}로 변경되었습니다.`, { message });
	}

	public async resetEngine({
		available_host_tools,
		user_request,
	}: {
		available_host_tools?: string[];
		user_request?: string;
	} = {}): Promise<EngineResponse> {
		this.expertContext = {
			available_host_tools: available_host_tools ?? [],
			user_request: user_request ?? '',
		};
		this.setEngineState(EngineState.IDLE, '엔진이 초기화되었습니다.');
		return {
			type: 'info',
			messages: [{ role: 'system', content: { type: 'text', text: '엔진이 초기화되었습니다.' } }],
		};
	}
}
