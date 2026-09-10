import { z } from 'zod';
import { ProjectStatus, ProjectPriority, WorkspaceRole } from '@/types/project';

// ─── Status / priority literals (from Prisma enums) ──────────────────────────

const projectStatuses: [ProjectStatus, ...ProjectStatus[]] = [
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED',
];

const projectPriorities: [ProjectPriority, ...ProjectPriority[]] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

const workspaceRoles: [WorkspaceRole, ...WorkspaceRole[]] = [
  'OWNER',
  'ADMIN',
  'MEMBER',
];

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required.' })
    .min(2, 'Project name must be at least 2 characters.')
    .max(100, 'Project name must be at most 100 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Project name cannot be empty.'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters.')
    .optional()
    .nullable()
    .transform((s) => (s?.trim() === '' ? null : s?.trim() ?? null)),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Project name must be at least 2 characters.')
      .max(100, 'Project name must be at most 100 characters.')
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, 'Project name cannot be empty.')
      .optional(),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters.')
      .nullable()
      .optional()
      .transform((s) => (s === undefined ? undefined : s?.trim() === '' ? null : s?.trim() ?? null)),
    status: z.enum(projectStatuses).optional(),
    priority: z.enum(projectPriorities).optional(),
    startDate: z.string().datetime({ offset: true }).nullable().optional(),
    dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  });

export const addProjectMemberSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID.'),
  role: z.enum(workspaceRoles),
});

export const updateProjectMemberSchema = z.object({
  role: z.enum(workspaceRoles),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberData = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberData = z.infer<typeof updateProjectMemberSchema>;
