import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ExpertExecutionEngine } from './core';
import { log, error } from './utils';
import { ExpertName } from './types';

const COMPONENT_NAME = 'MCP_Server_Main';

async function main() {
	const server = new McpServer({
		name: 'ecount-engine-server',
		version: '0.1.0',
	});

	const engine = new ExpertExecutionEngine(server.server);

	// Tool 1: 사용자 요청 처리를 시작하는 단일 진입점.
	server.registerTool(
		'process_request',
		{
			title: '사용자 요청 처리',
			description:
				'사용자의 모든 요청을 처리하는 가장 첫 번째 단계. 간단한 요청이라도 반드시 이 도구를 먼저 사용하세요.',
			inputSchema: {
				user_request: z.string(),
				available_host_tools: z.array(z.string()),
			},
		},
		async ({ user_request, available_host_tools }) => {
			const result = await engine.processRequest(user_request, available_host_tools);
			return { content: [{ type: 'text', text: JSON.stringify(result) }] };
		}
	);

	// Tool 2: 사용자가 계획을 승인했음을 호스트가 알리기 위해 호출합니다.
	server.registerTool(
		'execute_next_plan',
		{
			title: '다음 계획 실행',
			description:
				'사용자가 채팅으로 "예", "실행해" 등 명시적인 승인을 했을 경우에만 호출해야 합니다. 이 도구를 호출하면 커널이 이전에 승인 요청했던 계획의 실행을 시작합니다.',
			inputSchema: {
				expert_plans: z.array(
					z.object({
						expert: z.nativeEnum(ExpertName),
						task: z.object({
							type: z.string(),
							topic: z.string(),
							content: z.string(),
						}),
					})
				),
				prev_plan_index: z.number(),
				now_plan_index: z.number(),
				next_plan_index: z.number(),
				last_plan_index: z.number(),
			},
		},
		async ({ expert_plans, prev_plan_index, now_plan_index, next_plan_index, last_plan_index }) => {
			const finalReport = await engine.executeNextPlan(
				expert_plans,
				prev_plan_index,
				now_plan_index,
				next_plan_index,
				last_plan_index
			);
			return { content: [{ type: 'text', text: JSON.stringify(finalReport) }] };
		}
	);

	// Tool 3: 사용자가 계획 수정을 원할 경우 호스트가 호출합니다.
	server.registerTool(
		'replan_request',
		{
			title: '재계획 요청',
			description: '사용자의 요청에 의해 계획을 재수립하는 도구입니다.',
			inputSchema: {
				user_request: z.string(),
				available_host_tools: z.array(z.string()),
			},
		},
		async ({ user_request, available_host_tools }) => {
			const result = await engine.replan(user_request, available_host_tools);
			return { content: [{ type: 'text', text: JSON.stringify(result) }] };
		}
	);

	// Tool 4: 모든 상태를 초기화합니다.
	server.registerTool(
		'reset_engine',
		{
			title: '엔진 초기화',
			description: '사용자가 계획을 취소하거나, 엔진 초기화를 요청시 실행되는 도구',
		},
		async () => {
			const result = await engine.resetEngine();
			return { content: [{ type: 'text', text: JSON.stringify(result) }] };
		}
	);

	const transport = new StdioServerTransport();
	await server.connect(transport);

	log(COMPONENT_NAME, 'ECount Expert Execution Engine MCP Server가 시작되었고, stdio를 통해 연결되었습니다.');
}

main().catch((err) => {
	error(COMPONENT_NAME, 'MCP Server 시작 실패:', err);
	process.exit(1);
});
