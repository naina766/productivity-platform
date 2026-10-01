import { z } from 'zod';
import type { TaskStatus, TaskPriority } from '@/types/task';

const taskStatuses: [TaskStatus, ...TaskStatus[]] = [
  'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE',
];

const taskPriorities: [TaskPriority, ...TaskPriority[]] = [
  'LOW', 'MEDIUM', 'HIGH', 'URGENT',
];

export const savedViewFiltersSchema = z.object({
  status: z.array(z.enum(taskStatuses)).optional(),
  priority: z.array(z.enum(taskPriorities)).optional(),
  assigneeId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  hasDueDate: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
});

export const createSavedViewSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length >= 1 && s.length <= 80, 'Name must be between 1 and 80 characters'),
  projectId: z.string().uuid().nullable().optional(),
  filters: savedViewFiltersSchema.default({}),
  sortBy: z.enum(['dueDate', 'priority', 'status', 'createdAt', 'title']).nullable().optional(),
  sortOrder: z.enum(['asc', 'desc']).nullable().optional(),
  viewType: z.enum(['list', 'board', 'calendar']).default('list'),
  isShared: z.boolean().default(false),
});

export const updateSavedViewSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length >= 1 && s.length <= 80, 'Name must be between 1 and 80 characters')
    .optional(),
  filters: savedViewFiltersSchema.optional(),
  sortBy: z.enum(['dueDate', 'priority', 'status', 'createdAt', 'title']).nullable().optional(),
  sortOrder: z.enum(['asc', 'desc']).nullable().optional(),
  viewType: z.enum(['list', 'board', 'calendar']).optional(),
  isShared: z.boolean().optional(),
});
