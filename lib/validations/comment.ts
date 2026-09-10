import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required.' })
    .min(1, 'Comment content must be at least 1 character.')
    .max(2000, 'Comment content must be at most 2000 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Comment content cannot be empty.'),
});

export const updateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required.' })
    .min(1, 'Comment content must be at least 1 character.')
    .max(2000, 'Comment content must be at most 2000 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Comment content cannot be empty.'),
});

export type CreateCommentData = z.infer<typeof createCommentSchema>;
export type UpdateCommentData = z.infer<typeof updateCommentSchema>;