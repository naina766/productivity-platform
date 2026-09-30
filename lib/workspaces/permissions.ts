import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import type { WorkspaceRole } from '@/types/project';

const ROLE_RANK: Record<WorkspaceRole, number> = {
  MEMBER: 0,
  ADMIN: 1,
  OWNER: 2,
};

/** Single source of truth for role ordering: OWNER (2) > ADMIN (1) > MEMBER (0). */
export function roleRank(role: WorkspaceRole): number {
  return ROLE_RANK[role] ?? -1;
}

/** Throws 403 unless the user has a WorkspaceMember row for this workspace. */
export async function requireWorkspaceMember(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) {
    throw Errors.forbidden('You do not have access to this workspace.');
  }
  return membership;
}

/** Throws 403 unless the user is a member whose role is at least `minimumRole`. */
export async function requireWorkspaceRole(
  workspaceId: string,
  userId: string,
  minimumRole: WorkspaceRole,
) {
  const membership = await requireWorkspaceMember(workspaceId, userId);
  if (roleRank(membership.role) < roleRank(minimumRole)) {
    throw Errors.forbidden('You do not have permission for this action.');
  }
  return membership;
}
