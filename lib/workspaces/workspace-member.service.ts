import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireWorkspaceMember, requireWorkspaceRole } from '@/lib/workspaces/permissions';
import { createNotification } from '@/lib/notifications/notification.service';
import type { Prisma } from '@prisma/client';
import type { WorkspaceMemberItem } from '@/types/workspace';
import type { AddWorkspaceMemberData, UpdateWorkspaceMemberRoleData } from '@/lib/validations/workspace';

const memberInclude = {
  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
} as const;

type MemberRow = Prisma.WorkspaceMemberGetPayload<{ include: typeof memberInclude }>;

function serializeMember(m: MemberRow): WorkspaceMemberItem {
  return {
    id: m.id,
    userId: m.userId,
    role: m.role as WorkspaceMemberItem['role'],
    createdAt: m.createdAt.toISOString(),
    user: m.user,
  };
}

export async function getWorkspaceMembers(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMemberItem[]> {
  await requireWorkspaceMember(workspaceId, userId);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: memberInclude,
    orderBy: { createdAt: 'asc' },
  });

  return members.map(serializeMember);
}

/**
 * Add an existing account to the workspace by email.
 *
 * OWNER is rejected here: ownership is established when the workspace is
 * created, so it can never be granted through an invite.
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
    select: { id: true },
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
      include: memberInclude,
    });

    await createNotification(tx, {
      userId: target.id,
      title: `You were added to ${workspace.name}`,
      body: `You now have access to the "${workspace.name}" workspace.`,
    });

    return created;
  });

  return serializeMember(member);
}

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
    include: memberInclude,
  });
  if (!target) throw Errors.notFound('Workspace member not found.');

  if (target.role === 'OWNER') {
    throw Errors.forbidden('The workspace owner cannot be changed this way.');
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: target.id },
    data: { role },
    include: memberInclude,
  });

  return serializeMember(updated);
}

export async function removeWorkspaceMember(
  workspaceId: string,
  actorId: string,
  targetUserId: string,
): Promise<void> {
  await requireWorkspaceRole(workspaceId, actorId, 'ADMIN');

  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    select: { id: true, role: true },
  });
  if (!target) throw Errors.notFound('Workspace member not found.');

  if (target.role === 'OWNER') {
    throw Errors.forbidden('The workspace owner cannot be removed.');
  }

  await prisma.workspaceMember.delete({ where: { id: target.id } });
}
