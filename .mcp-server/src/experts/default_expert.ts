import {z} from 'zod';
import {AbstractExpert} from '../abstractions';
import {buildDefaultPrompt, defaultExpertPersona} from '../prompts';
import {ExpertContext, ExpertName, ExpertOutput, ExpertTask} from '../types';
import {createTaskSchema} from '../utils';

const DefaultTaskSchema = createTaskSchema(z.literal('default'), z.string());

type DefaultTaskPayload = z.infer<typeof DefaultTaskSchema>;

export class DefaultExpert extends AbstractExpert<ExpertTask> {
    public name = ExpertName.Default;
    public description =
        '파일 내용 분석, 정보 추출 등 특정 분야에 해당하지 않는 일반적인 요청을 처리하는 범용 전문가입니다.';
    public taskTypes = ['default'];

    public getInputSchema(): z.ZodObject<any> {
        return DefaultTaskSchema;
    }

    public async execute(
        context: ExpertContext,
        task: DefaultTaskPayload,
    ): Promise<ExpertOutput> {
        const userRequest = task.content;
        const prompt = buildDefaultPrompt(userRequest);

        return this.requestToHostLlm([
            {
                role: 'system',
                content: {type: 'text', text: defaultExpertPersona + prompt},
            },
        ]);
    }
}
