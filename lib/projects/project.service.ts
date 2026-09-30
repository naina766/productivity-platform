import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireWorkspaceMember } from '@/lib/workspaces/permissions';
import {
  requireProjectAccess,
  requireProjectManageAccess,
  canOwnerAction,
} from '@/lib/projects/permissions';
import { logActivity } from '@/lib/activity/activity.service';
import type { Prisma } from '@prisma/client';
import type { CreateProjectData, UpdateProjectData } from '@/lib/validations/project';
import type {
  ProjectSummary,
  ProjectDetail,
  ProjectMemberItem,
  WorkspaceRole,
} from '@/types/project';

const memberSelect = {
  id: true,
  userId: true,
  role: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
} as const;

type ProjectMemberRow = Prisma.ProjectMemberGetPayload<{ select: typeof memberSelect }>;

function serializeMember(m: ProjectMemberRow): ProjectMemberItem {
  return {
    id: m.id,
    userId: m.userId,
    role: m.role as WorkspaceRole,
    createdAt: m.createdAt.toISOString(),
    user: m.user,
  };
}

export async function getWorkspaceProjects(
  workspaceId: string,
  userId: string,
  search?: string,
): Promise<ProjectSummary[]> {
  await requireWorkspaceMember(workspaceId, userId);

  const projects = await prisma.project.findMany({
    where: {
      workspaceId,
      status: { not: 'ARCHIVED' },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      startDate: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { members: true } },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status as ProjectSummary['status'],
    priority: p.priority as ProjectSummary['priority'],
    startDate: p.startDate?.toISOString() ?? null,
    dueDate: p.dueDate?.toISOString() ?? null,
    memberCount: p._count.members,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getProjectById(projectId: string, userId: string): Promise<ProjectDetail> {
  await requireProjectAccess(projectId, userId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      startDate: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      workspaceId: true,
      workspace: { select: { id: true, name: true } },
      members: { select: memberSelect, orderBy: { createdAt: 'asc' } },
      _count: { select: { members: true } },
    },
  });
  if (!project) throw Errors.notFound('Project not found.');

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status as ProjectDetail['status'],
    priority: project.priority as ProjectDetail['priority'],
    startDate: project.startDate?.toISOString() ?? null,
    dueDate: project.dueDate?.toISOString() ?? null,
    memberCount: project._count.members,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    workspaceId: project.workspaceId,
    workspaceName: project.workspace.name,
    members: project.members.map(serializeMember),
  };
}

/**
 * Every workspace member may create a project. The creator is added as its
 * OWNER ProjectMember and a PROJECT_CREATED entry is logged, all in one
 * transaction.
 */
export async function createProject(
  workspaceId: string,
  userId: string,
  data: CreateProjectData,
): Promise<ProjectDetail> {
  await requireWorkspaceMember(workspaceId, userId);

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        workspaceId,
        name: data.name,
        description: data.description ?? null,
        status: 'ACTIVE',
        priority: 'MEDIUM',
      },
      select: { id: true },
    });

    await tx.projectMember.create({
      data: { projectId: created.id, userId, role: 'OWNER' },
    });

    await logActivity(tx, {
      projectId: created.id,
      actorId: userId,
      type: 'PROJECT_CREATED',
      message: `Created project "${data.name}"`,
      metadata: { name: data.name },
    });

    return created;
  });

  return getProjectById(project.id, userId);
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectData,
): Promise<ProjectDetail> {
  await requireProjectManageAccess(projectId, userId);

  const updateData: Prisma.ProjectUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  await prisma.project.update({ where: { id: projectId }, data: updateData });

  return getProjectById(projectId, userId);
}

/** Projects are archived, never deleted, so task history stays recoverable. */
export async function archiveProject(
  projectId: string,
  userId: string,
): Promise<{ id: string; status: string }> {
  await requireProjectManageAccess(projectId, userId);

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { status: 'ARCHIVED' },
    select: { id: true, status: true },
  });

  return { id: updated.id, status: updated.status };
}

export async function getProjectMembers(
  projectId: string,
  userId: string,
): Promise<ProjectMemberItem[]> {
  await requireProjectAccess(projectId, userId);

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: memberSelect,
    orderBy: { createdAt: 'asc' },
  });

  return members.map(serializeMember);
}

export async function addProjectMember(
  projectId: string,
  requesterId: string,
  targetUserId: string,
  role: WorkspaceRole,
): Promise<ProjectMemberItem> {
  const { project, membership } = await requireProjectManageAccess(projectId, requesterId);

  if (role === 'OWNER' && !canOwnerAction(membership.role)) {
    throw Errors.forbidden('Only an OWNER can assign the OWNER role.');
  }

  // The target must already belong to this workspace; project membership is
  // always a subset of workspace membership.
  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: targetUserId } },
    select: { userId: true },
  });
  if (!target) {
    throw Errors.forbidden('Target user is not a member of this workspace.');
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: { id: true },
  });
  if (existing) {
    throw Errors.conflict('User is already a member of this project.');
  }

  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.projectMember.create({
      data: { projectId, userId: targetUserId, role },
      select: memberSelect,
    });

    await logActivity(tx, {
      projectId,
      actorId: requesterId,
      type: 'MEMBER_ADDED',
      message: `Added ${created.user.name} to the project`,
      metadata: { userId: targetUserId, name: created.user.name, role },
    });

    return created;
  });

  return serializeMember(member);
}

export async function updateProjectMember(
  projectId: string,
  requesterId: string,
  targetUserId: string,
  role: WorkspaceRole,
): Promise<ProjectMemberItem> {
  const { membership } = await requireProjectManageAccess(projectId, requesterId);

  if (role === 'OWNER' && !canOwnerAction(membership.role)) {
    throw Errors.forbidden('Only an OWNER can assign the OWNER role.');
  }

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: { role: true },
  });
  if (!target) throw Errors.notFound('Project member not found.');

  if (target.role === 'OWNER' && !canOwnerAction(membership.role)) {
    throw Errors.forbidden('Only an OWNER can change the role of another OWNER.');
  }

  const updated = await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: { role },
    select: memberSelect,
  });

  return serializeMember(updated);
}

export async function removeProjectMember(
  projectId: string,
  requesterId: string,
  targetUserId: string,
): Promise<void> {
  const { membership } = await requireProjectManageAccess(projectId, requesterId);

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: { role: true, user: { select: { name: true } } },
  });
  if (!target) throw Errors.notFound('Project member not found.');

  if (target.role === 'OWNER' && !canOwnerAction(membership.role)) {
    throw Errors.forbidden('Only an OWNER can remove another OWNER.');
  }

  // A project must always keep at least one owner.
  if (target.role === 'OWNER') {
    const ownerCount = await prisma.projectMember.count({
      where: { projectId, role: 'OWNER' },
    });
    if (ownerCount <= 1) {
      throw Errors.forbidden(
        'Cannot remove the only project owner. Transfer ownership first.',
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectMember.delete({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });

    await logActivity(tx, {
      projectId,
      actorId: requesterId,
      type: 'MEMBER_REMOVED',
      message: `Removed ${target.user.name} from the project`,
      metadata: { userId: targetUserId, name: target.user.name },
    });
  });
}
