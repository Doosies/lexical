import {ExpertContext} from '../types';

export const ruleBasedExpertPersona = `당신은 '규칙 기반 실행 전문가'입니다. 당신의 임무는 주어진 규칙 파일을 해석하고, 그 지침에 따라 단계별 작업을 수행하는 것입니다. 당신은 규칙을 엄격하게 준수하며, 명시되지 않은 작업은 절대로 수행하지 않습니다.`;

export function buildExecuteStepPrompt(
    ruleContent: string,
    stepNumber: number | string,
    context?: ExpertContext,
): string {
    const contextString = context
        ? `
---

### 이전 단계 결과물 (Context) ###
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`
`
        : '';

    return `
### 임무: 규칙 기반 작업 수행 (Step ${stepNumber})

당신은 주어진 [규칙 파일]의 내용과 [이전 단계 결과물]을 바탕으로, 명시된 **Step ${stepNumber}**에 해당하는 작업을 정확히 수행해야 합니다.

---

### 규칙 파일 ###
${ruleContent}
${contextString}
---

### 작업 절차 ###
1.  **목표 Step 식별**: [규칙 파일]에서 \`## Step ${stepNumber}: ...\` 섹션을 찾습니다.
2.  **역할 분석**: 해당 Step의 \`[역할]: ...\` 설명을 분석하여 이번 단계에서 수행해야 할 구체적인 임무와 산출물이 무엇인지 파악합니다.
3.  **컨텍스트 활용**: 만약 [이전 단계 결과물]이 제공되었다면, 그 내용을 현재 Step을 수행하는 데 필요한 입력 데이터로 활용해야 합니다. (예: Step 2는 Step 1에서 생성된 JSON 설계도를 입력으로 사용)
4.  **최종 출력**: 해당 Step의 '[역할]'을 완수한 최종 결과물을 생성합니다. 출력 형식은 규칙에 명시된 산출물의 형태를 따라야 합니다. (예: Step 1의 결과물은 JSON 객체, Step 2의 결과물은 파일 작업 목록)
5.  **출력 정제**: 최종 결과물 외에 서론, 요약, 설명 등 어떤 추가 텍스트도 포함해서는 안 됩니다.

`;
}

export function buildGeneratePlanPrompt(ruleContent: string): string {
    return `
### 임무: 규칙 분석, 세부 계획 생성, 그리고 계획 주입

당신은 주어진 [규칙 파일]을 분석하여 상세한 실행 계획을 생성하고, 그 계획을 즉시 **도구를 사용하여** 전체 실행 흐름에 주입해야 합니다.

---

### 규칙 파일 ###
${ruleContent}

---

### 작업 절차 ###
1.  **규칙 구조 분석**: [규칙 파일]에서 \`## Step N: ...\` 형식의 제목을 가진 모든 섹션을 찾습니다.
2.  **세부 계획 JSON 생성**: 찾은 **모든 'Step'에 대해, 순서대로** 아래 구조를 따르는 JSON 객체를 생성하여 최종적으로 **JSON 배열**을 만듭니다.
    -   \`expert\`: \`"RuleBasedExpert"\`
    -   \`task.type\`: \`"execute_rule_step"\`
    -   \`task.topic\`: \`"Step N: {Step의 제목}"\`
    -   \`task.content\`: \`{ "rule_path": "{규칙 파일명}", "step_number": N }\`
    -   \`task.status\`: \`"pending"\`
3.  **계획 주입 (도구 호출)**: 2단계에서 생성한 JSON 배열을 사용하여 **반드시 \`set_plans\` 도구를 호출**해야 합니다.
    -   \`new_plans\` 파라미터에 생성한 JSON 배열을 전달합니다.
    -   \`index\` 파라미터는 현재 계획 바로 다음에 세부 계획을 삽입하기 위해 반드시 \`1\`로 설정합니다.
4.  **최종 출력**: 당신의 유일한 최종 출력은 \`set_plans\` 도구를 호출하는 것이어야 합니다. 어떤 설명이나 요약도 추가하지 마십시오.
`;
}
