import {z} from 'zod';
import {AbstractExpert} from '../abstractions';
import {
    buildKnowledgeRetrievePrompt,
    buildKnowledgeSavePrompt,
    knowledgeArchitectPersona,
} from '../prompts';
import {ExpertContext, ExpertName, ExpertOutput, ExpertTask} from '../types';
import {createTaskSchema, warn} from '../utils';

const KnowledgeBaseTaskSchema = createTaskSchema(
    z.enum(['retrieve', 'save']),
    z.string(),
);

type KnowledgeBaseTaskPayload = z.infer<typeof KnowledgeBaseTaskSchema>;

export class KnowledgeBaseExpert extends AbstractExpert<ExpertTask> {
    public name = ExpertName.KnowledgeBase;
    public description =
        '기존에 저장된 지식 베이스에서 특정 주제(topic)에 대한 정보를 검색(retrieve)하거나, 새로운 정보를 지식 베이스에 저장(save)합니다.';
    public taskTypes = ['retrieve', 'save'];

    public getInputSchema(): z.ZodObject<any> {
        return KnowledgeBaseTaskSchema;
    }

    public async execute(
        context: ExpertContext,
        task: KnowledgeBaseTaskPayload,
    ): Promise<ExpertOutput> {
        switch (task.type) {
            case 'retrieve':
                return this.retrieve(context, task.topic, task.content);
            case 'save':
                return this.saveDocument(context, task.topic, task.content);
            default:
                warn(this.name, `알 수 없는 작업 유형: ${task.type}`);
                throw new Error(`알 수 없는 작업 유형: ${task.type}`);
        }
    }

    private retrieve(
        context: ExpertContext,
        topic: string,
        content: string,
    ): ExpertOutput {
        const prompt = buildKnowledgeRetrievePrompt(content);
        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: knowledgeArchitectPersona + prompt,
                },
            },
        ]);
    }

    private saveDocument(
        context: ExpertContext,
        topic: string,
        content: string,
    ): ExpertOutput {
        const prompt = buildKnowledgeSavePrompt(content, topic);
        return this.requestToHostLlm([
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: knowledgeArchitectPersona + prompt,
                },
            },
        ]);
    }
}
