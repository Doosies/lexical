import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {z} from 'zod';
import {
    Expert,
    ExpertContext,
    ExpertName,
    ExpertOutput,
    ExpertPlan,
    ExpertTask,
    Message,
    PlanIndices,
} from '../types';
import {log} from '../utils';

export interface AbstractExpertParams {
    server: Server;
}
export abstract class AbstractExpert<TInput extends ExpertTask>
    implements Expert
{
    public abstract name: ExpertName;
    public abstract description: string;
    public abstract taskTypes: string[];
    protected readonly server: Server;

    // 내부 계획 관련 속성
    protected internalPlans: ExpertTask[] = [];
    protected internalPlanIndices: PlanIndices = {
        prev: -1,
        now: 0,
        next: 0,
        last: -1,
    };
    public isExecutingInternalPlan: boolean = false;

    constructor({server}: AbstractExpertParams) {
        this.server = server;
    }

    public abstract execute(
        context: ExpertContext,
        validatedInput: z.infer<ReturnType<this['getInputSchema']>>,
    ): Promise<ExpertOutput>;

    public async run(
        context: ExpertContext,
        input: TInput,
    ): Promise<ExpertOutput> {
        try {
            const schema = this.getInputSchema();

            // content가 JSON 문자열인 경우 객체로 파싱합니다.
            const inputToValidate = {...input};
            if (typeof inputToValidate.content === 'string') {
                try {
                    inputToValidate.content = JSON.parse(
                        inputToValidate.content,
                    );
                } catch (e) {
                    // 파싱에 실패하면 일반 문자열로 간주하고 그대로 둡니다.
                }
            }

            const validatedInput = schema.parse(inputToValidate);
            return this.execute(context, validatedInput);
        } catch (error) {
            log(this.name, `입력 데이터 형식이 올바르지 않습니다: ${error}`);
            throw new Error(`입력 데이터 형식이 올바르지 않습니다: ${error}`);
        }
    }

    public abstract getInputSchema(): z.ZodObject<any>;

    // 내부 계획 설정 및 상태 확인 메서드
    protected setInternalPlans(plans: ExpertTask[]): void {
        this.internalPlans = plans;
        this.internalPlanIndices = {
            prev: -1,
            now: 0,
            next: plans.length > 1 ? 1 : 0,
            last: plans.length > 0 ? plans.length - 1 : -1,
        };
        this.isExecutingInternalPlan = true;
        log(
            this.name,
            `내부 계획이 ${plans.length}개의 단계로 설정되었습니다.`,
        );
    }

    protected hasInternalPlans(): boolean {
        return this.internalPlans.length > 0;
    }

    public isInternalPlanCompleted(): boolean {
        return this.internalPlanIndices.now > this.internalPlanIndices.last;
    }

    // 내부 계획의 다음 단계를 실행하는 메서드 (하위 클래스에서 구현 필요)
    public async runNextInternalPlan(
        context: ExpertContext,
    ): Promise<ExpertOutput> {
        throw new Error(
            `${this.name} 전문가에 runNextInternalPlan 메서드가 구현되지 않았습니다.`,
        );
    }

    protected requestToHostLlm(
        messages: Message[],
        plans?: ExpertPlan[],
    ): ExpertOutput {
        log(this.name, `호스트 LLM 호출을 요청합니다...`);

        return {
            type: 'execution_plan',
            messages: messages,
            // plans: plans ?? [],
        };
    }
}
