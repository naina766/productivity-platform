/**
 * NOVA — Centralized project/workspace authorization helpers.
 *
 * All permission checks happen server-side here, never in components.
 * Route handlers call these before passing to the service layer.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import type { WorkspaceRole } from '@/types/project';

// ─── Role hierarchy ───────────────────────────────────────────────────────────

const ROLE_RANK: Record<WorkspaceRole, number> = {
  MEMBER: 0,
  ADMIN: 1,
  OWNER: 2,
};

function rankOf(role: WorkspaceRole): number {
  return ROLE_RANK[role] ?? -1;
}

// ─── Workspace membership checks ─────────────────────────────────────────────

/**
 * Returns the WorkspaceMember record for the user, or throws 403.
 * Never reveals whether the workspace itself exists to unauthorized users.
 */
export async function requireWorkspaceMember(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) {
    throw Errors.forbidden('You do not have access to this workspace.');
  }
  return membership;
}

/**
 * Ensures the user's workspace role meets the minimum required rank.
 */
export async function requireWorkspaceRole(
  workspaceId: string,
  userId: string,
  minimumRole: WorkspaceRole,
) {
  const membership = await requireWorkspaceMember(workspaceId, userId);
  if (rankOf(membership.role as WorkspaceRole) < rankOf(minimumRole)) {
    throw Errors.forbidden('You do not have permission for this action.');
  }
  return membership;
}

// ─── Project access checks ────────────────────────────────────────────────────

/**
 * Verifies the project exists and the user belongs to its workspace.
 * Returns the project with workspace info or throws 404 (to avoid IDOR leakage).
 */
export async function requireProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true, status: true, workspace: { select: { id: true, name: true } } },
  });

  if (!project) throw Errors.notFound('Project not found.');

  // Verify workspace membership — on failure return 404 to avoid exposing project existence.
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  });

  if (!membership) throw Errors.notFound('Project not found.');

  return { project, membership };
}

// ─── Role-based capability checks (pure) ─────────────────────────────────────

/** OWNER, ADMIN, or MEMBER may create projects. */
export function canCreateProject(_role: WorkspaceRole): boolean {
  return true; // all workspace members may create projects
}

/** Only OWNER or ADMIN may manage project settings and members. */
export function canManageProject(role: WorkspaceRole): boolean {
  return rankOf(role) >= rankOf('ADMIN');
}

/** Only OWNER may perform ownership-level actions. */
export function canOwnerAction(role: WorkspaceRole): boolean {
  return role === 'OWNER';
}

/**
 * Ensures the requesting user has at least ADMIN workspace role.
 * Used for project-level management operations.
 */
export async function requireProjectManageAccess(projectId: string, userId: string) {
  const { project, membership } = await requireProjectAccess(projectId, userId);
  if (!canManageProject(membership.role as WorkspaceRole)) {
    throw Errors.forbidden('You do not have permission to manage this project.');
  }
  return { project, membership };
}
