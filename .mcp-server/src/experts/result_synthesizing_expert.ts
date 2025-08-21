import {z} from 'zod';
import {AbstractExpert} from '../abstractions';
import {buildSynthesisPrompt, synthesisExpertPersona} from '../prompts';
import {ExpertContext, ExpertName, ExpertOutput, ExpertTask} from '../types';
import {createTaskSchema} from '../utils';

const SynthesisTaskSchema = createTaskSchema(
    z.literal('synthesize'),
    z.string(),
);

type SynthesisTaskPayload = z.infer<typeof SynthesisTaskSchema>;

export class ResultSynthesizingExpert extends AbstractExpert<ExpertTask> {
    public name = ExpertName.ResultSynthesizing;
    public description =
        '모든 전문가의 실행 결과를 종합하여 최종 보고서를 생성합니다.';
    public taskTypes = ['synthesize'];

    public getInputSchema(): z.ZodObject<any> {
        return SynthesisTaskSchema;
    }

    public async execute(
        context: ExpertContext,
        task: SynthesisTaskPayload,
    ): Promise<ExpertOutput> {
        const prompt = buildSynthesisPrompt(context.userRequest, task.content);

        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: synthesisExpertPersona + prompt,
                },
            },
        ]);
    }
}
