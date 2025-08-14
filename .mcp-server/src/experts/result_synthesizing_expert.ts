import { ExpertContext, ExpertOutput, ExpertTask } from '../types';
import { buildSynthesisPrompt, synthesisExpertPersona } from '../prompts';
import { ExpertName } from '../types';
import { AbstractExpert } from '../abstractions';

export class ResultSynthesizingExpert extends AbstractExpert<ExpertTask> {
	public name = ExpertName.ResultSynthesizing;
	public description = '모든 전문가의 실행 결과를 종합하여 최종 보고서를 생성합니다.';
	public taskTypes = ['synthesize'];

	public async execute(context: ExpertContext, task: ExpertTask): Promise<ExpertOutput> {
		const prompt = buildSynthesisPrompt(context.user_request, String(task.content));

		return this.requestToHostLlm(synthesisExpertPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
		]);
	}
}
