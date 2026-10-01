import { z } from 'zod';

export const createSubtaskSchema = z.object({
  title: z
    .string({ required_error: 'Subtask title is required.' })
    .min(1, 'Subtask title must be at least 1 character.')
    .max(200, 'Subtask title must be at most 200 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Subtask title cannot be empty.'),
  isCompleted: z.boolean().optional(),
});

export const updateSubtaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Subtask title must be at least 1 character.')
      .max(200, 'Subtask title must be at most 200 characters.')
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, 'Subtask title cannot be empty.')
      .optional(),
    isCompleted: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.isCompleted !== undefined ||
      data.position !== undefined,
    { message: 'At least one field must be provided to update a subtask.' }
  );

export type CreateSubtaskData = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskData = z.infer<typeof updateSubtaskSchema>;
