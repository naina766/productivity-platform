/**
 * NOVA — Phase 4 project types.
 * These are API-safe serialised shapes, not Prisma models.
 * Dates are ISO strings; no internal DB fields exposed.
 */

// ─── Enums (mirror Prisma enums, safe to use on the client) ──────────────────

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

// ─── Safe sub-types ───────────────────────────────────────────────────────────

export interface SafeProjectUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface ProjectMemberItem {
  id: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  user: SafeProjectUser;
}

// ─── Project shapes ───────────────────────────────────────────────────────────

/** Lean summary used in list views (dashboard). */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  dueDate: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Full project detail including members. */
export interface ProjectDetail extends ProjectSummary {
  workspaceId: string;
  workspaceName: string;
  members: ProjectMemberItem[];
}

// ─── Input types (mirror Zod output) ─────────────────────────────────────────

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface AddProjectMemberInput {
  userId: string;
  role: WorkspaceRole;
}

export interface UpdateProjectMemberInput {
  role: WorkspaceRole;
}
