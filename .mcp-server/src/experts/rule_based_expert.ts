import {z} from 'zod';
import {AbstractExpert, type AbstractExpertParams} from '../abstractions';
import * as fs from 'fs';
import * as path from 'path';
import {
    buildExecuteStepPrompt,
    buildGeneratePlanPrompt,
    ruleBasedExpertPersona,
} from '../prompts';
import {
    ExpertContext,
    ExpertName,
    ExpertOutput,
    ExpertTask,
    Message,
} from '../types';
import {createTaskSchema, log} from '../utils';

const COMPONENT_NAME = 'RuleBasedExpert';

// Zod 스키마 정의
const planGenerationStrategyTaskSchema = createTaskSchema(
    z.literal('plan_generation_strategy'),
    z.object({
        rulePaths: z.array(z.string()),
    }),
);

const executeRuleStepTaskSchema = createTaskSchema(
    z.literal('execute_rule_step'),
    z.object({
        rule_content: z.string(),
        step_number: z.number(),
    }),
);

const RuleBasedTaskSchema = z.union([
    planGenerationStrategyTaskSchema,
    executeRuleStepTaskSchema,
]);

type RuleBasedTask = z.infer<typeof RuleBasedTaskSchema>;

export class RuleBasedExpert extends AbstractExpert<RuleBasedTask> {
    public name = ExpertName.RuleBased;
    public description =
        '주어진 규칙 파일(예: Markdown)을 기반으로 단계별 작업을 생성하고 실행하는 전문가입니다.';
    public taskTypes = ['plan_generation_strategy', 'execute_rule_step'];

    public getInputSchema() {
        return RuleBasedTaskSchema as any;
    }

    public async execute(
        context: ExpertContext,
        task: RuleBasedTask,
    ): Promise<ExpertOutput> {
        // Zod 스키마를 사용하여 입력 데이터의 유효성을 검사합니다.
        // const validatedInput = this.getInputSchema().parse(task);

        // validatedInput의 타입에 따라 적절한 핸들러를 호출합니다.
        switch (task.type) {
            case 'plan_generation_strategy':
                return this._handlePlanGenerationStrategyTask(context, task);
            case 'execute_rule_step':
                return this._handleExecuteRuleStepTask(context, task);
            default:
                throw new Error(
                    `지원하지 않는 task type 입니다: ${(task as any).type}`,
                );
        }
    }

    public override async runNextInternalPlan(
        context: ExpertContext,
    ): Promise<ExpertOutput> {
        const nowStepIndex = this.internalPlanIndices.now;
        const currentStep = this.internalPlans[nowStepIndex];

        if (!currentStep) {
            throw new Error(
                `내부 계획에서 ${nowStepIndex}번째 단계를 찾을 수 없습니다.`,
            );
        }

        log(
            COMPONENT_NAME,
            `내부 계획 ${nowStepIndex + 1}/${
                this.internalPlans.length
            } 단계 실행: ${currentStep.topic}`,
        );

        // 기존의 단계 실행 핸들러를 재사용
        const stepTaskForHandler = {
            type: 'execute_rule_step',
            topic: currentStep.topic,
            content: currentStep.content,
            status: 'in_progress',
        } as const;

        // 타입 호환성을 위해 schema parse 한번 더 수행
        const validatedStepTask =
            executeRuleStepTaskSchema.parse(stepTaskForHandler);

        const output = await this._handleExecuteRuleStepTask(
            context,
            validatedStepTask,
        );

        // 내부 계획 인덱스 증가
        this.internalPlanIndices.prev = nowStepIndex;
        this.internalPlanIndices.now = nowStepIndex + 1;
        this.internalPlanIndices.next = nowStepIndex + 2;

        return output;
    }

    private _parseRuleFileToInternalPlans(
        fileContent: string,
        ruleFilePath: string,
    ): ExpertTask[] {
        const lines = fileContent.split('\n');

        // Strategy 1: "## Step N:" 또는 "## N단계:" 형식 찾기
        let tasks = lines
            .map((line) => line.trim())
            .filter((line) => /^##\s+(Step\s+\d+|(\d+단계))/.test(line))
            .map((line) => {
                const stepTitle = line.replace('## ', '').trim();
                const stepMatch = stepTitle.match(/(\d+)/);
                const stepNumber = stepMatch ? parseInt(stepMatch[1], 10) : 0;
                return {
                    type: 'execute_rule_step',
                    topic: `Executing Rule Step: ${stepTitle}`,
                    content: {
                        rule_content: fileContent,
                        step_number: stepNumber,
                    },
                    status: 'pending',
                } as ExpertTask;
            });

        if (tasks.length > 0) {
            log(
                COMPONENT_NAME,
                `규칙 파일(${ruleFilePath})을 "## Step N" 전략으로 파싱했습니다.`,
            );
            return tasks;
        }

        // Strategy 2: H2 제목 (##) 찾기
        tasks = lines
            .map((line) => line.trim())
            .filter((line) => line.startsWith('## '))
            .map((line, index) => {
                const stepTitle = line.replace('## ', '').trim();
                return {
                    type: 'execute_rule_step',
                    topic: `Executing Rule Step: ${stepTitle}`,
                    content: {
                        rule_content: fileContent,
                        step_number: index + 1,
                    },
                    status: 'pending',
                } as ExpertTask;
            });

        if (tasks.length > 0) {
            log(
                COMPONENT_NAME,
                `규칙 파일(${ruleFilePath})을 "H2 제목" 전략으로 파싱했습니다.`,
            );
            return tasks;
        }

        // Strategy 3: Markdown 리스트 항목 찾기
        tasks = lines
            .map((line) => line.trim())
            .filter((line) => /^\s*(-|\*|\d+\.)\s+/.test(line))
            .map((line, index) => {
                const stepTitle = line
                    .replace(/^\s*(-|\*|\d+\.)\s+/, '')
                    .trim();
                return {
                    type: 'execute_rule_step',
                    topic: `Executing Rule Step: ${stepTitle}`,
                    content: {
                        rule_content: fileContent,
                        step_number: index + 1,
                    },
                    status: 'pending',
                } as ExpertTask;
            });

        if (tasks.length > 0) {
            log(
                COMPONENT_NAME,
                `규칙 파일(${ruleFilePath})을 "Markdown 리스트" 전략으로 파싱했습니다.`,
            );
            return tasks;
        }

        // Strategy 4: 전체 파일을 단일 단계로 처리 (Fallback)
        log(
            COMPONENT_NAME,
            `규칙 파일(${ruleFilePath})에서 구조화된 단계를 찾지 못해, 전체를 단일 단계로 처리합니다.`,
        );
        return [
            {
                type: 'execute_rule_step',
                topic: `Executing rule file '${ruleFilePath}' as a single step`,
                content: {rule_content: fileContent, step_number: 1},
                status: 'pending',
            },
        ] as ExpertTask[];
    }

    private async _handlePlanGenerationStrategyTask(
        context: ExpertContext,
        task: z.infer<typeof planGenerationStrategyTaskSchema>,
    ): Promise<ExpertOutput> {
        const {rulePaths} = task.content;
        const ruleFilePath = rulePaths[0];

        const absoluteRuleFilePath = path.resolve(
            context.workspacePath,
            ruleFilePath,
        );

        const fileContent = fs.readFileSync(absoluteRuleFilePath, 'utf-8');

        // 개선된 파싱 로직 호출
        const internalPlanTasks = this._parseRuleFileToInternalPlans(
            fileContent,
            ruleFilePath,
        );

        // 3. 내부 계획 설정
        this.setInternalPlans(internalPlanTasks);

        // 4. Host LLM에게 신호 보내기
        const messages: Message[] = [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `규칙 파일(${ruleFilePath}) 분석을 완료하고 ${internalPlanTasks.length}개의 내부 실행 계획을 수립했습니다. 이제 \`execute_next_internal_plan\` 도구를 호출하여 첫 번째 단계를 실행하세요.`,
                },
            },
        ];

        return {
            type: 'info',
            messages,
        };
    }

    private async _handleExecuteRuleStepTask(
        context: ExpertContext,
        task: z.infer<typeof executeRuleStepTaskSchema>,
    ): Promise<ExpertOutput> {
        const {step_number, rule_content} = task.content;
        const promptString = buildExecuteStepPrompt(
            rule_content,
            step_number,
            context,
        );
        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: ruleBasedExpertPersona + promptString,
                },
            },
        ]);
    }
}
