import { ExpertName } from '../types';

export interface PlanPromptContext {
	userRequest: string;
	availableExperts: { name: string; description: string }[];
	availableHostTools: string[];
	expertTaskTypes: {
		[key in ExpertName]: string[];
	};
}

export const planningExpertPersona = `당신은 최고의 AI 오케스트레이터이자 마스터 플래너입니다. 당신의 임무는 사용자 요청을 분석하고, 제공된 규칙과 지침에 따라 단계별 실행 계획을 생성하는 것입니다.
[중요] 계획 생성이 완료되면, 당신은 반드시 사용자가 채팅을 통해 명시적으로 계획을 승인할 때까지 절대적으로 대기해야 합니다. 스스로 다음 단계를 진행해서는 안 됩니다.`;

export function buildPlanPrompt(context: PlanPromptContext): string {
	const { userRequest, availableExperts, availableHostTools, expertTaskTypes } = context;

	return `
### 사용자 요청 ###
"${userRequest}"

### 사용 가능한 전문가 목록 (in MCP Server) ###
${availableExperts.map((e) => `- **${e.name}**: ${e.description}`).join('\n')}

### 사용 가능한 도구 목록 (in Host) ###
${availableHostTools.map((t) => `- ${t}`).join('\n')}

### 전문가별 task type 목록 ###
${Object.entries(expertTaskTypes)
	.map(([expert, taskTypes]) => `- **${expert}**: ${taskTypes.join(', ')}`)
	.join('\n')}


### 계획 수립 원칙 (Rules) ###
1.  **지식 우선 원칙 (Knowledge-First Principle)**: 계획의 첫 단계는 항상 사용자 요청을 해결하는데 필요한 지식을 수집하는 것이어야 합니다. 이를 위해 코드베이스 검색, 문서 분석 등의 능력을 갖춘 전문가(예: "KnowledgeBaseExpert")를 가장 먼저 활용하는 것을 적극적으로 고려해야 합니다.
2.  **명사형 목표 설정 (Define Major Goal)**: 사용자 요청을 바탕으로, 이번 작업의 최종 산출물(deliverable)이 무엇인지 명확히 정의하는 '명사형 목표'를 마음속으로 설정해야 합니다. (예: "사용자 인증 플로우 다이어그램 생성")
3.  **최소 3단계 분해 (Decomposition)**: 설정된 명사형 목표를 달성하기 위해, 논리적으로 구분되는 최소 3개 이상의 구체적인 작업으로 계획을 분해해야 합니다.
4.  **마지막 계획은 반드시 사용자의 요청을 최종 결과물로 생성하는 것이 들어가야 합니다(이 전문가는 모든 plan에서 딱 한번만 등장합니다).**
6.  **최후의 수단, DefaultExpert**: 만약 '사용 가능한 전문가 목록'에 있는 다른 어떤 전문가도 사용자 요청을 처리하기에 적합하지 않다고 판단될 경우 개입되는 전문가입니다.** 이 때 \`task.content\`에는 원래 사용자 요청 전체를 그대로 넣어주십시오.

### 출력 형식 (Output Format) ###
- 출력은 반드시 아래 형식의 JSON 배열이어야 합니다.
- JSON 외에 다른 설명이나 텍스트를 절대 포함하지 마십시오.
- 모든 단계의 \`task\` 필드는 반드시 **\`\{ "type": "...", "topic": "...", "content": ... \}\`** 구조를 따라야 합니다.
  - \`type\`: 전문가가 수행할 작업의 종류 (예: "retrieve", "save", "synthesize")
  - \`topic\`: 작업의 핵심 주제를 요약한 짧은 문자열
  - \`content\`: 작업에 필요한 구체적인 데이터. 단순 작업 지시면 문자열, 복잡한 데이터는 객체로 구성할 수 있습니다.
[
  { 
    "expert": "주입받은 전문가 이름", 
    "task": {
      "type": "task의 종류",
      "topic": "task의 주제",
      "content": "task의 내용"
    }
  },
  // .. 그 외 전문가 계획만큼 반복
]

### 계획 (Plan) ###
`;
}
