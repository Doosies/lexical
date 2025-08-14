import { warn } from 'console';
import { AbstractExpert } from '../abstractions';
import { ExpertTask, ExpertName, ExpertContext, ExpertOutput } from '../types';
import { buildFlexionCodeAnalyzePrompt, buildFlexionCodeWriteCodePrompt, flexionCodeExpertPersona } from '../prompts';

export class FlexionCodeExpert extends AbstractExpert<ExpertTask> {
	public name = ExpertName.FlexionCode;
	public description = 'Flexion(Lexical 프레임워크 기반 프레임워크) 코드 분석 및 수정 전문가입니다.';
	public taskTypes = ['analyze', 'write_code'];

	public async execute(context: ExpertContext, task: ExpertTask): Promise<ExpertOutput> {
		// this.server.
		switch (task.type) {
			case 'analyze':
				return this.analyze(context, task.topic, String(task.content));
			case 'write_code':
				return this.writeCode(context, task.topic, String(task.content));
			default:
				warn(this.name, `알 수 없는 작업 유형: ${task.type}`);
				return {
					type: 'error',
					messages: [{ role: 'system', content: { type: 'text', text: '알 수 없는 작업 유형' } }],
				};
		}
	}

	private analyze(context: ExpertContext, topic: string, content: string): ExpertOutput {
		const prompt = buildFlexionCodeAnalyzePrompt(content);
		return this.requestToHostLlm(flexionCodeExpertPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
		]);
	}

	private writeCode(context: ExpertContext, topic: string, content: string): ExpertOutput {
		const prompt = buildFlexionCodeWriteCodePrompt(content);
		return this.requestToHostLlm(flexionCodeExpertPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
		]);
	}
}
