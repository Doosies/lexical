export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: { type: 'text'; text: string };
}
