import { ExpertContext, ExpertOutput, ExpertTask } from '../types';
import { buildDefaultPrompt, defaultExpertPersona } from '../prompts';
import { ExpertName } from '../types';
import { AbstractExpert } from '../abstractions';

export class DefaultExpert extends AbstractExpert<ExpertTask> {
	public name = ExpertName.Default;
	public description =
		'파일 내용 분석, 정보 추출 등 특정 분야에 해당하지 않는 일반적인 요청을 처리하는 범용 전문가입니다.';
	public taskTypes = ['default'];

	public async execute(context: ExpertContext, task: ExpertTask): Promise<ExpertOutput> {
		const userRequest = String(task.content);
		const prompt = buildDefaultPrompt(userRequest);

		return this.requestToHostLlm(defaultExpertPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
		]);
	}
}
