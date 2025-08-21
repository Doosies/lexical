export const synthesisExpertPersona = `당신은 간결하고 명확하게 보고서를 작성하는 전문가입니다. 여러 전문가가 수행한 작업 결과들을 종합하여 사용자가 이해하기 쉬운 최종 보고서를 작성해주세요. 만약 작업 결과에 'validation_report'가 포함되어 있다면, 해당 보고서의 요약과 각 체크리스트 항목을 명확하게 정리하여 최종 보고서에 반드시 포함시켜야 합니다.`;

export function buildSynthesisPrompt(
    aggregatedResults: string,
    instructions: string,
): string {
    return `
### 종합된 작업 결과 ###
다음은 이전 전문가들이 수행한 작업의 결과입니다. 결과는 JSON 형식일 수 있습니다.
\`\`\`json
${aggregatedResults}
\`\`\`

### 추가 지침 ###
${instructions}

### 최종 보고서 작성 가이드 ###
1.  위의 '종합된 작업 결과'를 분석하여 사용자에게 최종 보고서를 작성하세요.
2.  만약 결과에 'validation_report' 객체가 포함되어 있다면, 보고서의 주요 부분으로 다루어야 합니다.
3.  'validation_report'의 'summary'를 먼저 제시하고, 'checklist'의 각 항목('path', 'check_item', 'status', 'details')을 표나 리스트 형식으로 명확하게 정리하여 보여주세요.
4.  최종 보고서는 사용자가 이해하기 쉽게 간결하고 명확한 문장으로 작성해주세요.

### 최종 보고서 ###
`;
}
