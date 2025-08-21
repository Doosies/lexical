import {z} from 'zod';
import {zodToJsonSchema} from 'zod-to-json-schema';
import {AbstractExpert} from '../abstractions';
import {buildPlanPrompt, planningExpertPersona} from '../prompts';
import {ExpertContext, ExpertName, ExpertOutput, ExpertTask} from '../types';
import {createTaskSchema, expertRegistry} from '../utils';

const PlanningTaskSchema = createTaskSchema(z.literal('planning'), z.string());

type PlanningTaskPayload = z.infer<typeof PlanningTaskSchema>;

export class PlanningExpert extends AbstractExpert<ExpertTask> {
    public name = ExpertName.Planning;
    public description =
        '사용자 요청을 분석하고 순서대로 호출할 전문가에 대한 상위 수준의 계획을 생성합니다.';
    public taskTypes = ['planning'];

    public getInputSchema(): z.ZodObject<any> {
        return PlanningTaskSchema;
    }

    public async execute(
        context: ExpertContext,
        task: PlanningTaskPayload,
    ): Promise<ExpertOutput> {
        const userRequest = task.content;
        const availableExperts = expertRegistry.values
            .filter((expert) => expert.name !== ExpertName.Planning)
            .map((expert) => {
                const schema = expert.getInputSchema();
                const jsonSchema = zodToJsonSchema(schema, {
                    target: 'openApi3',
                });
                return {
                    name: expert.name,
                    description: expert.description,
                    inputSchema: jsonSchema,
                };
            });
        const expertTaskTypes = expertRegistry.values.reduce(
            (acc, expert) => {
                acc[expert.name] = expert.taskTypes;
                return acc;
            },
            {} as Record<ExpertName, string[]>,
        );

        const prompt = buildPlanPrompt({
            userRequest,
            availableExperts,
            expertTaskTypes,
        });

        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: planningExpertPersona + prompt,
                },
            },
        ]);
    }
}
