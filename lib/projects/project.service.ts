/**
 * NOVA — Project service layer.
 *
 * All business logic lives here. Route handlers are kept thin.
 * Authorization is enforced before any DB write.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import {
  requireWorkspaceMember,
  requireProjectAccess,
  requireProjectManageAccess,
  canCreateProject,
} from '@/lib/projects/permissions';
import { logActivity } from '@/lib/activity/activity.service';
import type { CreateProjectData, UpdateProjectData } from '@/lib/validations/project';
import type {
  ProjectSummary,
  ProjectDetail,
  ProjectMemberItem,
  WorkspaceRole,
} from '@/types/project';

// ─── Safe field selects (never expose passwordHash etc.) ──────────────────────

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

const memberSelect = {
  id: true,
  userId: true,
  role: true,
  createdAt: true,
  user: { select: safeUserSelect },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serializeDate(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

// ─── Read operations ──────────────────────────────────────────────────────────

/**
 * List all non-archived projects for a workspace.
 * Optional `search` matches the project name or description (insensitive).
 * Verifies the requesting user is a workspace member.
 */
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
    startDate: serializeDate(p.startDate),
    dueDate: serializeDate(p.dueDate),
    memberCount: p._count.members,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

/**
 * Get full project detail including members.
 * Verifies workspace membership (returns 404 for IDOR protection).
 */
export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<ProjectDetail> {
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
    startDate: serializeDate(project.startDate),
    dueDate: serializeDate(project.dueDate),
    memberCount: project._count.members,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    workspaceId: project.workspaceId,
    workspaceName: project.workspace.name,
    members: project.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role as WorkspaceRole,
      createdAt: m.createdAt.toISOString(),
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
      },
    })),
  };
}

// ─── Write operations ─────────────────────────────────────────────────────────

/**
 * Create a project atomically.
 * Verifies workspace membership, then creates Project + owner ProjectMember
 * in a single transaction.
 */
export async function createProject(
  workspaceId: string,
  userId: string,
  data: CreateProjectData,
): Promise<ProjectDetail> {
  const membership = await requireWorkspaceMember(workspaceId, userId);

  if (!canCreateProject(membership.role as WorkspaceRole)) {
    throw Errors.forbidden('You do not have permission to create projects.');
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        workspaceId,
        name: data.name,
        description: data.description ?? null,
        status: 'ACTIVE',
        priority: 'MEDIUM',
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: created.id,
        userId,
        role: 'OWNER',
      },
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

/**
 * Update allowed project fields.
 * Requires at least ADMIN workspace role.
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectData,
): Promise<ProjectDetail> {
  await requireProjectManageAccess(projectId, userId);

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if ('startDate' in data) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if ('dueDate' in data) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  await prisma.project.update({
    where: { id: projectId },
    data: updateData,
  });

  return getProjectById(projectId, userId);
}

/**
 * Soft-archive a project (sets status = ARCHIVED).
 * Requires at least ADMIN workspace role.
 */
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

// ─── Member operations ────────────────────────────────────────────────────────

/**
 * List project members (verifies caller has workspace access).
 */
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

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role as WorkspaceRole,
    createdAt: m.createdAt.toISOString(),
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
    },
  }));
}

/**
 * Add a user to a project.
 * Requires the requesting user to have ADMIN+ workspace role.
 * Target user must already be a member of the same workspace.
 */
export async function addProjectMember(
  projectId: string,
  requesterId: string,
  targetUserId: string,
  role: WorkspaceRole,
): Promise<ProjectMemberItem> {
  const { project, membership } = await requireProjectManageAccess(projectId, requesterId);

  // Prevent a non-OWNER from assigning OWNER role.
  if (role === 'OWNER' && membership.role !== 'OWNER') {
    throw Errors.forbidden('Only an OWNER can assign the OWNER role.');
  }

  // Verify target user belongs to the same workspace.
  const targetMembership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: targetUserId } },
  });
  if (!targetMembership) {
    throw Errors.forbidden('Target user is not a member of this workspace.');
  }

  // Prevent duplicate membership.
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
  if (existing) {
    throw Errors.conflict('User is already a member of this project.');
  }

  const created = await prisma.$transaction(async (tx) => {
    const member = await tx.projectMember.create({
      data: { projectId, userId: targetUserId, role },
      select: memberSelect,
    });

    await logActivity(tx, {
      projectId,
      actorId: requesterId,
      type: 'MEMBER_ADDED',
      message: `Added ${member.user.name} to the project`,
      metadata: { userId: targetUserId, name: member.user.name, role },
    });

    return member;
  });

  return {
    id: created.id,
    userId: created.userId,
    role: created.role as WorkspaceRole,
    createdAt: created.createdAt.toISOString(),
    user: {
      id: created.user.id,
      name: created.user.name,
      email: created.user.email,
      avatarUrl: created.user.avatarUrl,
    },
  };
}

/**
 * Change a project member's role.
 * Requires the requesting user to have ADMIN+ workspace role.
 * Only OWNER can assign or demote OWNER.
 */
export async function updateProjectMember(
  projectId: string,
  requesterId: string,
  targetUserId: string,
  role: WorkspaceRole,
): Promise<ProjectMemberItem> {
  const { membership } = await requireProjectManageAccess(projectId, requesterId);

  // Only OWNER may assign or change OWNER role.
  if (role === 'OWNER' && membership.role !== 'OWNER') {
    throw Errors.forbidden('Only an OWNER can assign the OWNER role.');
  }

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
  if (!target) throw Errors.notFound('Project member not found.');

  // Prevent non-OWNER from demoting an OWNER.
  if (target.role === 'OWNER' && membership.role !== 'OWNER') {
    throw Errors.forbidden('Only an OWNER can change the role of another OWNER.');
  }

  const updated = await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: { role },
    select: memberSelect,
  });

  return {
    id: updated.id,
    userId: updated.userId,
    role: updated.role as WorkspaceRole,
    createdAt: updated.createdAt.toISOString(),
    user: {
      id: updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      avatarUrl: updated.user.avatarUrl,
    },
  };
}

/**
 * Remove a project member.
 * Requires the requesting user to have ADMIN+ workspace role.
 * Prevents removing the last OWNER.
 */
export async function removeProjectMember(
  projectId: string,
  requesterId: string,
  targetUserId: string,
): Promise<void> {
  const { membership } = await requireProjectManageAccess(projectId, requesterId);

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: {
      role: true,
      user: { select: { name: true } },
    },
  });
  if (!target) throw Errors.notFound('Project member not found.');

  // Prevent non-OWNER from removing an OWNER.
  if (target.role === 'OWNER' && membership.role !== 'OWNER') {
    throw Errors.forbidden('Only an OWNER can remove another OWNER.');
  }

  // Protect last owner.
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
