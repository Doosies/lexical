// server.createMessage로 Host Client에게 샘플링을 요청할 때 사용하려 했는데 cursor에서 이를 지원안함
export const llmConfig = {
	maxTokens: {
		planning: 1500,
		knowledgeRetrieval: 2000,
		knowledgeSaving: 2500, // 문서 생성 및 저장을 위해 충분한 토큰 할당
		synthesis: 1000,
	},
	/**  0에 가까울수록 확실한 답변을 생성하고, 1에 가까울수록 창의적인 답변을 생성합니다.*/
	temperature: {
		// 계획은 일관성 있고 예측 가능해야 하므로 낮은 값으로 설정합니다.
		planning: 0.2,
		// 지식 검색/분석은 사실 기반이어야 하므로 매우 낮은 값으로 설정합니다.
		knowledgeRetrieval: 0.1,
		// 지식 저장은 창의성과 사실 기반의 균형을 맞춥니다.
		knowledgeSaving: 0.3,
		// 최종 보고서는 약간의 창의성을 허용하여 더 자연스러운 문장을 생성합니다.
		synthesis: 0.5,
	},
};
