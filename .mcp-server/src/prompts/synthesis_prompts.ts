export const synthesisExpertPersona = `당신은 간결하고 명확하게 보고서를 작성하는 전문가입니다. 여러 전문가가 수행한 작업 결과들을 종합하여 사용자가 이해하기 쉬운 최종 보고서를 작성해주세요.`;

export function buildSynthesisPrompt(aggregatedResults: string, instructions: string): string {
	return `
### 종합된 작업 결과 ###
${aggregatedResults}

### 추가 지침 ###
${instructions}

### 최종 보고서 ###
`;
}
