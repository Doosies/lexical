import { buildPlanPrompt, planningExpertPersona } from '../prompts';
import { ExpertContext, ExpertOutput } from '../types';
import { ExpertName } from '../types';
import { AbstractExpert } from '../abstractions';
import { expertRegistry } from '../utils';

export class PlanningExpert extends AbstractExpert<string> {
	public name = ExpertName.Planning;
	public description = '사용자 요청을 분석하고 순서대로 호출할 전문가에 대한 상위 수준의 계획을 생성합니다.';
	public taskTypes = ['planning'];

	public async execute(context: ExpertContext, userRequest: string): Promise<ExpertOutput> {
		const availableExperts = expertRegistry.values
			.filter((expert) => expert.name !== ExpertName.Planning)
			.map((expert) => ({
				name: expert.name,
				description: expert.description,
			}));
		const availableHostTools = context.available_host_tools;
		const expertTaskTypes = expertRegistry.values.reduce((acc, expert) => {
			acc[expert.name] = expert.taskTypes;
			return acc;
		}, {} as Record<ExpertName, string[]>);

		const prompt = buildPlanPrompt({
			userRequest,
			availableExperts,
			availableHostTools,
			expertTaskTypes,
		});

		return this.requestToHostLlm(planningExpertPersona, [
			{ role: 'system', content: { type: 'text', text: prompt } },
			{
				role: 'assistant',
				content: {
					type: 'text',
					text: '1. 계획을 세운후, 사용자에게 계획을 "[전문가]: 계획" 형식으로 전달해야 합니다.',
				},
			},
			{
				role: 'assistant',
				content: {
					type: 'text',
					text: ' 2. 어떠한 경우에도 사용자에게 직접 "계획이 생성되었습니다. 이 계획으로 진행해도 괜찮을까요? 라고 물어보고 응답시까지 대기해야 합니다."',
				},
			},
		]);
	}
}
