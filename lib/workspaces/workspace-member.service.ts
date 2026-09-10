/**
 * NOVA — Workspace member service layer.
 *
 * Manages workspace membership: list, add, change role, remove.
 * Only OWNER/ADMIN may mutate membership.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '@/lib/projects/permissions';
import type { WorkspaceMemberItem } from '@/types/workspace';
import type {
  AddWorkspaceMemberData,
  UpdateWorkspaceMemberRoleData,
} from '@/lib/validations/workspace';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

function serializeMember(m: {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}): WorkspaceMemberItem {
  return {
    id: m.id,
    userId: m.userId,
    role: m.role as WorkspaceMemberItem['role'],
    createdAt: m.createdAt.toISOString(),
    user: m.user,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * List all members of a workspace. Requires the caller to be a member.
 */
export async function getWorkspaceMembers(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMemberItem[]> {
  await requireWorkspaceMember(workspaceId, userId);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: safeUserSelect } },
    orderBy: { createdAt: 'asc' },
  });

  return members.map(serializeMember);
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Add an existing NOVA user to the workspace by email.
 * Only OWNER/ADMIN may add members.
 */
export async function addWorkspaceMember(
  workspaceId: string,
  actorId: string,
  input: AddWorkspaceMemberData,
): Promise<WorkspaceMemberItem> {
  const { email, role } = input;

  if (role !== 'ADMIN' && role !== 'MEMBER') {
    throw Errors.validation('Role must be ADMIN or MEMBER.');
  }

  await requireWorkspaceRole(workspaceId, actorId, 'ADMIN');

  const target = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  if (!target) {
    throw Errors.notFound('No account found with that email address.');
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: target.id } },
    select: { id: true },
  });

  if (existing) {
    throw Errors.conflict('That user is already a member of this workspace.');
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  if (!workspace) throw Errors.notFound('Workspace not found.');

  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.workspaceMember.create({
      data: { workspaceId, userId: target.id, role },
      include: { user: { select: safeUserSelect } },
    });

    await tx.notification.create({
      data: {
        userId: target.id,
        taskId: null,
        title: `You were added to ${workspace.name}`,
        body: `You now have access to the "${workspace.name}" workspace.`,
      },
    });

    return created;
  });

  return serializeMember(member);
}

/**
 * Change a member's role. Only OWNER/ADMIN may change roles.
 * The workspace owner's role cannot be changed.
 */
export async function updateWorkspaceMemberRole(
  workspaceId: string,
  actorId: string,
  targetUserId: string,
  input: UpdateWorkspaceMemberRoleData,
): Promise<WorkspaceMemberItem> {
  const { role } = input;

  if (role !== 'ADMIN' && role !== 'MEMBER') {
    throw Errors.validation('Role must be ADMIN or MEMBER.');
  }

  await requireWorkspaceRole(workspaceId, actorId, 'ADMIN');

  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    include: { user: { select: safeUserSelect } },
  });

  if (!target) throw Errors.notFound('Workspace member not found.');

  if (target.role === 'OWNER') {
    throw Errors.forbidden('The workspace owner cannot be changed this way.');
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: target.id },
    data: { role },
    include: { user: { select: safeUserSelect } },
  });

  return serializeMember(updated);
}

/**
 * Remove a member from the workspace. Only OWNER/ADMIN may remove members.
 * The workspace owner cannot be removed.
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  actorId: string,
  targetUserId: string,
): Promise<void> {
  await requireWorkspaceRole(workspaceId, actorId, 'ADMIN');

  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });

  if (!target) throw Errors.notFound('Workspace member not found.');

  if (target.role === 'OWNER') {
    throw Errors.forbidden('The workspace owner cannot be removed.');
  }

  await prisma.workspaceMember.delete({ where: { id: target.id } });
}
