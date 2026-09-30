import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { roleRank } from '@/lib/workspaces/permissions';
import type { WorkspaceRole } from '@/types/project';

/** Only OWNER and ADMIN may change project settings, membership, or archive a project. */
export function canManageProject(role: WorkspaceRole): boolean {
  return roleRank(role) >= roleRank('ADMIN');
}

/** Only OWNER may grant, reassign, or revoke the OWNER role. */
export function canOwnerAction(role: WorkspaceRole): boolean {
  return role === 'OWNER';
}

/**
 * Resolve a project and confirm the caller is a member of its workspace.
 *
 * A non-member receives 404 rather than 403 so the response never confirms that
 * a project id exists in someone else's workspace.
 */
export async function requireProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true, status: true, workspace: { select: { id: true, name: true } } },
  });
  if (!project) throw Errors.notFound('Project not found.');

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  });
  if (!membership) throw Errors.notFound('Project not found.');

  return { project, membership };
}

export async function requireProjectManageAccess(projectId: string, userId: string) {
  const { project, membership } = await requireProjectAccess(projectId, userId);
  if (!canManageProject(membership.role)) {
    throw Errors.forbidden('You do not have permission to manage this project.');
  }
  return { project, membership };
}
