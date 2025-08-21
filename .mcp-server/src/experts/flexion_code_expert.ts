import {z} from 'zod';
import {AbstractExpert} from '../abstractions';
import {
    buildFlexionCodeAnalyzePrompt,
    buildFlexionCodeWriteCodePrompt,
    flexionCodeExpertPersona,
} from '../prompts';
import {ExpertContext, ExpertName, ExpertOutput, ExpertTask} from '../types';
import {createTaskSchema} from '../utils';

const FlexionCodeTaskSchema = createTaskSchema(
    z.enum(['analyze', 'write_code']),
    z.string(),
);

type FlexionCodeTaskPayload = z.infer<typeof FlexionCodeTaskSchema>;

export class FlexionCodeExpert extends AbstractExpert<ExpertTask> {
    public name = ExpertName.FlexionCode;
    public description =
        'Flexion(Lexical 프레임워크 기반 프레임워크) 코드 분석 및 수정 전문가입니다.';
    public taskTypes = ['analyze', 'write_code'];
    public getInputSchema(): z.ZodObject<any> {
        return FlexionCodeTaskSchema;
    }

    public async execute(
        context: ExpertContext,
        task: FlexionCodeTaskPayload,
    ): Promise<ExpertOutput> {
        switch (task.type) {
            case 'analyze':
                return this.analyze(context, task.topic, task.content);
            case 'write_code':
                return this.writeCode(context, task.topic, task.content);
            default:
                throw new Error(`알 수 없는 작업 유형: ${task.type}`);
        }
    }

    private analyze(
        context: ExpertContext,
        topic: string,
        content: string,
    ): ExpertOutput {
        const prompt = buildFlexionCodeAnalyzePrompt(content);
        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: flexionCodeExpertPersona + prompt,
                },
            },
        ]);
    }

    private writeCode(
        context: ExpertContext,
        topic: string,
        content: string,
    ): ExpertOutput {
        const prompt = buildFlexionCodeWriteCodePrompt(content);
        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: flexionCodeExpertPersona + prompt,
                },
            },
        ]);
    }
}
