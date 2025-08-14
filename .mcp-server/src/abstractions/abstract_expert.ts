import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Expert, ExpertContext, ExpertOutput, Message, ExpertName } from '../types';
import { log } from '../utils';

export interface AbstractExpertParams {
	server: Server;
}
export abstract class AbstractExpert<TInput> implements Expert<TInput> {
	/** 전문가 이름 */
	public abstract name: ExpertName;
	/** 전문가 설명 */
	public abstract description: string;
	/** 전문가가 처리할 작업의 종류 */
	public abstract taskTypes: string[];
	protected readonly server: Server;

	constructor({ server }: AbstractExpertParams) {
		this.server = server;
	}

	public abstract execute(context: ExpertContext, input: TInput): Promise<ExpertOutput>;

	protected requestToHostLlm(systemPrompt: string, messages: Message[]): ExpertOutput {
		log(this.name, `호스트 LLM 호출을 요청합니다...`);

		return {
			type: 'llm_request',
			systemPrompt: systemPrompt,
			messages: messages,
		};
	}
}
