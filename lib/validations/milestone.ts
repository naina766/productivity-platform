import { z } from 'zod';
import type { MilestoneStatus } from '@/types/milestone';

const milestoneStatuses: [MilestoneStatus, ...MilestoneStatus[]] = ['OPEN', 'COMPLETED'];

export const createMilestoneSchema = z.object({
  title: z
    .string({ required_error: 'Milestone title is required.' })
    .min(1, 'Milestone title must be at least 1 character.')
    .max(200, 'Milestone title must be at most 200 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Milestone title cannot be empty.'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters.')
    .optional()
    .nullable()
    .transform((s) => (s?.trim() === '' ? null : s?.trim() ?? null)),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable(),
});

export const updateMilestoneSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Milestone title must be at least 1 character.')
      .max(200, 'Milestone title must be at most 200 characters.')
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, 'Milestone title cannot be empty.')
      .optional(),
    description: z
      .string()
      .max(5000)
      .nullable()
      .optional()
      .transform((s) => (s === undefined ? undefined : s?.trim() === '' ? null : s?.trim() ?? null)),
    dueDate: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional(),
    status: z.enum(milestoneStatuses).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.dueDate !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided to update a milestone.' }
  );

export type CreateMilestoneData = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneData = z.infer<typeof updateMilestoneSchema>;
