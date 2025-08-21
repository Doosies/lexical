import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';

import {z} from 'zod';
import {ExpertExecutionEngine} from './core';
import {ExpertName} from './types';
import {checkTemplateFiles, log} from './utils';
import {error} from 'console';

const COMPONENT_NAME = 'MCP_Server_Main';

async function main() {
    const server = new McpServer({
        name: 'ecount-engine-server',
        version: '0.1.0',
    });

    const engine = new ExpertExecutionEngine(server.server);

    server.registerTool(
        'get_plans',
        {
            title: '실행 계획 가져오기',
            description: '현재 실행 계획을 가져옵니다.',
            outputSchema: {
                plans: z.array(
                    z.object({
                        expert: z.nativeEnum(ExpertName),
                        task: z.object({
                            type: z.string(),
                            topic: z.string(),
                            content: z.union([
                                z.string(),
                                z.record(z.unknown()),
                            ]),
                            status: z.enum([
                                'pending',
                                'in_progress',
                                'completed',
                                'cancelled',
                            ]),
                        }),
                    }),
                ),
                indices: z.object({
                    prev: z.number(),
                    now: z.number(),
                    next: z.number(),
                    last: z.number(),
                }),
            },
        },
        () => {
            log(COMPONENT_NAME, 'get-plans 도구 호출', engine.getPlanState());
            return {
                content: [],
                structuredContent: engine.getPlanState(),
            };
        },
    );

    // Tool 1: 사용자 요청 처리를 시작하는 단일 진입점.
    server.registerTool(
        'generate_planning_prompt',
        {
            title: '계획 수립 프롬프트 요청',
            description:
                '이 툴은 계획을 직접 생성하지 않고, 계획 생성을 위한 프롬프트를 반환합니다. 반드시 후속 단계에서 LLM 또는 다른 Expert를 통해 plan JSON을 만들어야 합니다.',
            inputSchema: {
                user_request: z.string(),
            },
            outputSchema: {
                messages: z
                    .array(
                        z.object({
                            role: z.enum(['user', 'assistant', 'system']),
                            content: z.object({
                                type: z.literal('text'),
                                text: z.string(),
                            }),
                        }),
                    )
                    .optional(),
                type: z.enum(['info', 'error', 'execution_plan', 'plan']),
            },
        },
        async ({user_request}) => {
            if (!engine.getIsUserExplicitlyCalledTool()) {
                throw new Error(
                    '이 도구는 유저가 명시적으로 prompt를 호출한후에 사용할 수 있습니다. LLM이 자의적으로 사용하는 것은 불가능합니다. 사용자에게 planning_prompt 사용을 요청해야 합니다.',
                );
            }
            const result = await engine.generatePlanningPrompt(user_request);
            log(
                COMPONENT_NAME,
                'generate_planning_prompt 도구 호출 결과:',
                result,
            );
            return {
                content: [],
                structuredContent: {...result},
            };
        },
    );

    // Tool 2: 사용자가 계획을 승인했음을 호스트가 알리기 위해 호출합니다.
    server.registerTool(
        'execute_next_plan',
        {
            title: '다음 계획 실행',
            description:
                '사용자의 명시적인 승인 발화(예: "예", "승인", "실행해")가 있어야만 호출할 수 있습니다.',
            inputSchema: {
                is_user_approved: z
                    .boolean()
                    .optional()
                    .transform((v) => v ?? false),
                is_first_plan: z.boolean(),
                is_last_plan: z.boolean(),
            },
            outputSchema: {
                messages: z.array(
                    z.object({
                        role: z.enum(['user', 'assistant', 'system']),
                        content: z.object({
                            type: z.literal('text'),
                            text: z.string(),
                        }),
                    }),
                ),
                action: z.string().optional(),
                type: z.enum(['info', 'error', 'execution_plan', 'plan']),
                note: z.string().optional(),
                prev_plan_index: z.number().optional(),
                now_plan_index: z.number().optional(),
                next_plan_index: z.number().optional(),
                now_expert: z.string().optional(),
            },
        },
        async ({is_user_approved, is_first_plan, is_last_plan}) => {
            if (is_first_plan && !is_user_approved) {
                throw new Error(
                    '사용자의 명시적인 승인 발화(예: "예", "승인", "실행해")가 없습니다. 사용자가 최초 승인시 now_plan_index은 0으로 시작합니다. 사용자에게 승인을 요청해야 합니다.',
                );
            }

            const finalReport = await engine.executeNextPlan();
            log(
                COMPONENT_NAME,
                'execute_next_plan 도구 호출 결과:',
                finalReport,
            );
            return {
                content: [],
                structuredContent: {...finalReport},
            };
        },
    );

    // Prompt 1: 사용자가 계획 수정을 원할 경우 호출합니다.
    server.registerPrompt(
        'replan_request',
        {
            title: '재계획 요청',
            description:
                '현재 계획을 취소하고 새로운 사용자 요청에 따라 재계획을 수행합니다.',
            argsSchema: {
                user_request: z.string().describe('사용자의 새로운 요청'),
            },
        },
        async ({user_request}) => {
            const result = await engine.replan(user_request);
            return {
                content: [],
                messages: (result.messages ?? []) as any,
            };
        },
    );

    // Tool 3: 실행 계획을 동적으로 수정합니다.
    server.registerTool(
        'set_plans',
        {
            title: '계획을 설정합니다.',
            description:
                '현재 실행 계획의 특정 위치에 새로운 단계를 동적으로 삽입합니다. 인덱스 중간, 맨끝 어디든 삽입 가능합니다.(0번째 인덱스에 넣어서 덮어쓰기도 가능)',
            inputSchema: {
                new_plans: z.array(
                    z.object({
                        expert: z.nativeEnum(ExpertName),
                        task: z.object({
                            type: z.string(),
                            topic: z.string(),
                            content: z.union([
                                z.string(),
                                z.record(z.unknown()),
                            ]),
                            status: z.enum([
                                'pending',
                                'in_progress',
                                'completed',
                                'cancelled',
                            ]),
                        }),
                    }),
                ),
                index: z
                    .number()
                    .optional()
                    .describe('새로운 계획을 삽입할 위치 인덱스'),
                type: z
                    .enum(['insert'])
                    .default('insert')
                    .describe('수정 유형 (현재는 insert만 지원)'),
            },
            outputSchema: {
                success: z.boolean(),
                message: z.string().optional(),
            },
        },
        async ({new_plans, index, type}) => {
            const result = await engine.insertPlanSteps(new_plans, index, type);
            return {
                content: [],
                structuredContent: result,
            };
        },
    );

    // Tool 4: 모든 상태를 초기화합니다.
    server.registerTool(
        'reset_engine',
        {
            title: '엔진 초기화',
            description:
                '사용자가 계획을 취소하거나, 모든 계획이 수행되었거나, 엔진(상태) 초기화를 요청시 실행되는 도구',
        },
        async () => {
            const result = await engine.resetEngine();
            return {
                content: [{type: 'text', text: JSON.stringify(result)}],
            };
        },
    );

    // server.registerTool(
    //     'execute_next_internal_plan',
    //     {
    //         title: '다음 내부 계획 실행',
    //         description:
    //             '현재 활성화된 전문가의 내부 계획 다음 단계를 실행합니다.',
    //         outputSchema: {
    //             messages: z.array(
    //                 z.object({
    //                     role: z.enum(['user', 'assistant', 'system']),
    //                     content: z.object({
    //                         type: z.literal('text'),
    //                         text: z.string(),
    //                     }),
    //                 }),
    //             ),
    //             action: z.string().optional(),
    //             type: z.enum(['info', 'error', 'execution_plan', 'plan']),
    //             note: z.string().optional(),
    //             prev_plan_index: z.number().optional(),
    //             now_plan_index: z.number().optional(),
    //             next_plan_index: z.number().optional(),
    //             now_expert: z.string().optional(),
    //         },
    //     },
    //     async () => {
    //         const result = await engine.executeNextInternalPlan();
    //         return {
    //             content: [],
    //             structuredContent: {...result},
    //         };
    //     },
    // );

    server.registerTool(
        'complete_and_advance_plan',
        {
            title: '현재 계획 완료 및 다음으로 이동',
            description:
                '현재 계획 단계를 완료로 표시하고 다음 계획으로 인덱스를 이동시킵니다.',
            outputSchema: {
                success: z.boolean(),
                indices: z.object({
                    prev: z.number(),
                    now: z.number(),
                    next: z.number(),
                    last: z.number(),
                }),
                message: z.string().optional(),
            },
        },
        async () => {
            const result = await engine.completeAndAdvancePlan();
            return {
                content: [],
                structuredContent: result,
            };
        },
    );

    server.registerPrompt(
        'planning_prompt',
        {
            title: '계획 수립 프롬프트',
            description: '계획 수립 프롬프트',
        },
        () => {
            engine.setIsUserExplicitlyCalledTool(true);
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: '이 프롬프트는 계획 생성을 위한 단계입니다. 반드시 generate_planning_prompt 도구를 호출해 계획 생성을 준비하세요.',
                        },
                    },
                ],
            };
        },
    );
    server.registerPrompt(
        'boilerplate_prompt',
        {
            title: '보일러플레이트 생성 프롬프트',
            description: '보일러플레이트 생성 프롬프트',
            argsSchema: {
                템플릿_종류: z.string(),
                템플릿_디렉토리: z.string(),
            },
        },
        async ({템플릿_종류, 템플릿_디렉토리}) => {
            engine.resetEngine();
            const template_types = ['flexion'];

            if (!template_types.includes(템플릿_종류)) {
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `입력된 \`${템플릿_종류}\`는 지원하지 않는 템플릿 종류입니다. 지원하는 템플릿 종류는 \`[${template_types.join(
                                    ', ',
                                )}]\` 입니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요.`,
                            },
                        },
                    ],
                };
            }
            engine.setIsUserExplicitlyCalledTool(true);

            const full_path = `D:/ecxsolution/flexion/packages/flexion-templates/src/${템플릿_디렉토리}`;
            let dir_check_msg:
                | {role: 'user'; content: {type: 'text'; text: string}}
                | undefined;
            // 파일 없는경우 확인
            const template_check_result = checkTemplateFiles(템플릿_디렉토리);
            log(COMPONENT_NAME, 'template_check_result', template_check_result);
            switch (template_check_result.status) {
                case 'NOT_FOUND':
                    dir_check_msg = {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `템플릿 경로(${full_path})가 존재하지 않습니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요`,
                        },
                    };
                    break;
                case 'NO_PERMISSION':
                    dir_check_msg = {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `템플릿(${full_path})에 접근 권한이 없습니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요`,
                        },
                    };
                    break;
                case 'NO_FILES':
                    dir_check_msg = {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `템플릿(${full_path}) 하위에 파일이 없습니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요`,
                        },
                    };
                    break;
                case 'NO_TYPES_FILE':
                    dir_check_msg = {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `템플릿(${full_path}) 하위에 types.ts 파일이 존재하지 않습니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요`,
                        },
                    };
                    break;
                case 'SINGLE_FILE_MISSING_CONFIG':
                    if (template_check_result.isTypesFile) {
                        dir_check_msg = {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `템플릿(${full_path}) 하위에 template config 파일이 존재하지 않습니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요`,
                            },
                        };
                    } else {
                        dir_check_msg = {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `템플릿(${full_path}) 하위에 template types 파일이 존재하지 않습니다. "다시 시도해주세요" 라는 메시지를 사용자(저)에게 보여준후 대기하세요. 이 때 다른 도구를 사용하지 않고, 메세지를 출력후 바로 종료하세요`,
                            },
                        };
                    }
                    break;
            }
            if (dir_check_msg !== undefined) {
                return {messages: [dir_check_msg]};
            }
            // 6. 계획을 세웠으면 mcp_ai_set_plans 도구를 호출해 현재 세운 계획을 설정합니다.(이 때 규칙파일, 템플릿파일, 계획을 다시 보고할 필요는 없습니다.)
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `
                            '${템플릿_종류}' 템플릿과 '${템플릿_디렉토리}' 디렉토리에 대한 보일러플레이트 생성 계획을 수립합니다.

                            **지시사항:**
                            1. \`.cursor/rules\`에서 '${템플릿_종류}' 관련 규칙 파일과 \`${full_path}\`에서 템플릿 파일을 수집합니다.
                            2. 수집된 파일 목록을 \`user_request\`에 담아 \`generate_planning_prompt\` 도구를 호출하여 실행 계획(JSON)을 생성합니다.
                            3. 생성된 JSON 계획으로 \`set_plans\`를 호출하고, 전체 계획을 \`[전문가]: [내용]\` 형식으로 사용자에게 보여준 뒤 "계획을 완료했습니다. 승인해주세요" 라는 메시지와 함께 승인을 요청합니다.
`,
                        },
                    },
                ],
            };
        },
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);

    log(
        COMPONENT_NAME,
        'ECount Expert Execution Engine MCP Server가 시작되었고, stdio를 통해 연결되었습니다.',
    );
}

main().catch((err) => {
    error(COMPONENT_NAME, 'MCP Server 시작 실패:', err);
    process.exit(1);
});
