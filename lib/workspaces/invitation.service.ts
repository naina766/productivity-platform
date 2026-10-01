import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireWorkspaceRole, requireWorkspaceMember } from '@/lib/workspaces/permissions';
import { createNotification } from '@/lib/notifications/notification.service';
import type {
  WorkspaceInvitationItem,
  CreateInvitationInput,
  PublicInvitationDetails,
} from '@/types/invitation';

interface DbInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  token: string;
  invitedById: string;
  status: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  workspace?: {
    name: string;
  };
  invitedBy?: {
    name: string;
  };
}

export function serializeInvitation(inv: DbInvitation): WorkspaceInvitationItem {
  return {
    id: inv.id,
    workspaceId: inv.workspaceId,
    workspaceName: inv.workspace?.name,
    email: inv.email,
    role: inv.role as WorkspaceInvitationItem['role'],
    token: inv.token,
    invitedById: inv.invitedById,
    invitedByName: inv.invitedBy?.name,
    status: inv.status as WorkspaceInvitationItem['status'],
    expiresAt: inv.expiresAt.toISOString(),
    acceptedAt: inv.acceptedAt ? inv.acceptedAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    inviteUrl: `/invite/${inv.token}`,
  };
}

export async function createWorkspaceInvitation(
  workspaceId: string,
  actorId: string,
  input: CreateInvitationInput
): Promise<WorkspaceInvitationItem> {
  const { email, role = 'MEMBER' } = input;
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Only admins or owners can invite
  await requireWorkspaceRole(workspaceId, actorId, 'ADMIN');

  // 2. Check if user with this email is already a member
  const targetUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (targetUser) {
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUser.id,
        },
      },
    });
    if (existingMember) {
      throw Errors.conflict('That user is already a member of this workspace.');
    }
  }

  // 3. Check if there's already an active pending invitation
  const existingInvite = await prisma.workspaceInvitation.findFirst({
    where: {
      workspaceId,
      email: normalizedEmail,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  });

  if (existingInvite) {
    return serializeInvitation(existingInvite);
  }

  // 4. Generate token and 7-day expiration
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      email: normalizedEmail,
      role,
      token,
      invitedById: actorId,
      status: 'PENDING',
      expiresAt,
    },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  });

  return serializeInvitation(invitation);
}

export async function listWorkspaceInvitations(
  workspaceId: string,
  actorId: string
): Promise<WorkspaceInvitationItem[]> {
  await requireWorkspaceMember(workspaceId, actorId);

  // Auto-expire past-due pending invitations
  await prisma.workspaceInvitation.updateMany({
    where: {
      workspaceId,
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { workspaceId },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return invitations.map(serializeInvitation);
}

export async function revokeWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
  actorId: string
): Promise<void> {
  await requireWorkspaceRole(workspaceId, actorId, 'ADMIN');

  const invitation = await prisma.workspaceInvitation.findFirst({
    where: { id: invitationId, workspaceId },
  });
  if (!invitation) {
    throw Errors.notFound('Invitation not found.');
  }

  if (invitation.status === 'ACCEPTED') {
    throw Errors.badRequest('Cannot revoke an already accepted invitation.');
  }

  await prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: { status: 'REVOKED' },
  });
}

export async function getInvitationByToken(token: string): Promise<PublicInvitationDetails> {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  });

  if (!invitation) {
    throw Errors.notFound('Invitation not found or invalid link.');
  }

  const isExpired = invitation.expiresAt < new Date() || invitation.status === 'EXPIRED';

  return {
    id: invitation.id,
    workspaceId: invitation.workspaceId,
    workspaceName: invitation.workspace.name,
    email: invitation.email,
    role: invitation.role as PublicInvitationDetails['role'],
    invitedByName: invitation.invitedBy.name,
    status: isExpired && invitation.status === 'PENDING' ? 'EXPIRED' : (invitation.status as PublicInvitationDetails['status']),
    expiresAt: invitation.expiresAt.toISOString(),
    isExpired,
  };
}

export async function acceptWorkspaceInvitation(
  token: string,
  userId: string
): Promise<{ workspaceId: string; workspaceName: string; role: string }> {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: {
      workspace: { select: { id: true, name: true, ownerId: true } },
      invitedBy: { select: { name: true } },
    },
  });

  if (!invitation) {
    throw Errors.notFound('Invitation not found or invalid link.');
  }

  if (invitation.status === 'ACCEPTED') {
    throw Errors.conflict('This invitation has already been accepted.');
  }

  if (invitation.status === 'REVOKED') {
    throw Errors.badRequest('This invitation has been revoked by an administrator.');
  }

  if (invitation.expiresAt < new Date() || invitation.status === 'EXPIRED') {
    throw Errors.badRequest('This invitation has expired.');
  }

  // Check if user is already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId,
      },
    },
  });

  if (existingMember) {
    // Mark accepted if not already marked
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
    return {
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspace.name,
      role: existingMember.role,
    };
  }

  // Accept and add member in transaction
  await prisma.$transaction(async (tx) => {
    await tx.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      },
    });

    await tx.workspaceInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    await createNotification(tx, {
      userId,
      title: `Welcome to ${invitation.workspace.name}`,
      body: `You joined the workspace via invitation from ${invitation.invitedBy.name}.`,
    });

    // Notify workspace owner
    if (invitation.workspace.ownerId !== userId) {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
      await createNotification(tx, {
        userId: invitation.workspace.ownerId,
        title: 'New Member Joined',
        body: `${user?.name || 'A new member'} accepted an invitation to ${invitation.workspace.name}.`,
      });
    }
  });

  return {
    workspaceId: invitation.workspaceId,
    workspaceName: invitation.workspace.name,
    role: invitation.role,
  };
}
