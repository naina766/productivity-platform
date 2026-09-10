import { z } from 'zod';
import type { TaskStatus, TaskPriority } from '@/types/task';

const taskStatuses: [TaskStatus, ...TaskStatus[]] = [
  'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE',
];

const taskPriorities: [TaskPriority, ...TaskPriority[]] = [
  'LOW', 'MEDIUM', 'HIGH', 'URGENT',
];

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required.' })
    .min(1, 'Task title must be at least 1 character.')
    .max(200, 'Task title must be at most 200 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Task title cannot be empty.'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters.')
    .optional()
    .nullable()
    .transform((s) => (s?.trim() === '' ? null : s?.trim() ?? null)),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  assigneeId: z
    .string()
    .uuid('assigneeId must be a valid UUID.')
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable(),
  labelIds: z
    .array(z.string().uuid())
    .optional(),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(200)
      .transform((s) => s.trim())
      .optional(),
    description: z
      .string()
      .max(5000)
      .nullable()
      .optional()
      .transform((s) => (s === undefined ? undefined : s?.trim() === '' ? null : s?.trim() ?? null)),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    assigneeId: z
      .string()
      .uuid()
      .nullable()
      .optional(),
    dueDate: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional(),
    position: z.number().int().min(0).optional(),
    labelIds: z
      .array(z.string().uuid())
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  });

export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
