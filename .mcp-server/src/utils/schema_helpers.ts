import {z, ZodType} from 'zod';

/**
 * 표준 ExpertTask Zod 스키마를 생성하는 헬퍼 함수.
 *
 * @param type - 'type' 필드에 대한 Zod 스키마 (e.g., z.literal('generate'), z.enum(['a', 'b'])).
 * @param content - 'content' 필드에 대한 Zod 스키마 (e.g., z.string(), z.object({...})).
 * @returns 완전한 ExpertTask Zod 스키마.
 */
export function createTaskSchema<T extends ZodType, C extends ZodType>(
    type: T,
    content: C,
) {
    return z.object({
        type,
        topic: z.string(),
        content,
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    });
}
