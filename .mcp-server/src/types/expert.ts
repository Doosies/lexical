import { Message } from './common';
import { ExpertName } from './expert_name';

export type ExpertContext = {
	user_request: string;
	available_host_tools: string[];
};

export type ExpertOutputType = 'llm_request' | 'llm_response' | 'info' | 'error';

export type ExpertOutput = {
	type: ExpertOutputType;
	systemPrompt?: string;
	messages: Message[];
	temperature?: number;
	maxTokens?: number;
	note?: string;
};

export interface ExpertTask {
	type: string; // 전문가가 수행할 작업의 종류 (예: "retrieve", "save", "synthesize")
	topic: string; // 작업의 주제 또는 제목
	content: string; // 작업에 필요한 데이터 (단순 문자열, 또는 복잡한 객체)
}

export type ExpertPlans = {
	expert: ExpertName;
	task: ExpertTask; // 표준화된 ExpertTask 타입을 사용합니다.
}[];

export interface Expert<TInput = unknown> {
	name: ExpertName;
	taskTypes: string[];
	description: string;
	execute(context: ExpertContext, input: TInput): Promise<ExpertOutput>;
}
