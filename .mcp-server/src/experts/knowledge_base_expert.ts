import { ExpertContext, ExpertOutput, ExpertTask } from '../types';
import { buildKnowledgeRetrievePrompt, buildKnowledgeSavePrompt, knowledgeArchitectPersona } from '../prompts';
import { ExpertName } from '../types';
import { warn } from '../utils';
import { AbstractExpert } from '../abstractions';

export class KnowledgeBaseExpert extends AbstractExpert<ExpertTask> {
	public name = ExpertName.KnowledgeBase;
	public description =
		'기존에 저장된 지식 베이스에서 특정 주제(topic)에 대한 정보를 검색(retrieve)하거나, 새로운 정보를 지식 베이스에 저장(save)합니다.';
	public taskTypes = ['retrieve', 'save'];

	public async execute(context: ExpertContext, task: ExpertTask): Promise<ExpertOutput> {
		switch (task.type) {
			case 'retrieve':
				return this.retrieve(context, task.topic, String(task.content));
			case 'save':
				const contentAsString =
					typeof task.content === 'string' ? task.content : JSON.stringify(task.content, null, 2);
				return this.saveDocument(context, task.topic, contentAsString);
			default:
				warn(this.name, `알 수 없는 작업 유형: ${task.type}`);
				return {
					type: 'error',
					messages: [{ role: 'system', content: { type: 'text', text: '알 수 없는 작업 유형' } }],
				};
		}
	}

	private retrieve(context: ExpertContext, topic: string, content: string): ExpertOutput {
		const prompt = buildKnowledgeRetrievePrompt(content);
		return this.requestToHostLlm(knowledgeArchitectPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
		]);
	}

	private saveDocument(context: ExpertContext, topic: string, content: string): ExpertOutput {
		const prompt = buildKnowledgeSavePrompt(content, topic);
		return this.requestToHostLlm(knowledgeArchitectPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
		]);
	}
}
