import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireProjectAccess, requireProjectManageAccess } from '@/lib/projects/permissions';
import type { CreateMilestoneData, UpdateMilestoneData } from '@/lib/validations/milestone';
import type { MilestoneItem, MilestoneStatus } from '@/types/milestone';

export function serializeMilestone(m: {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: string;
  tasks?: Array<{ status: string }>;
  createdAt: Date;
  updatedAt: Date;
}): MilestoneItem {
  const tasks = m.tasks ?? [];
  const taskCount = tasks.length;
  const completedTaskCount = tasks.filter((t) => t.status === 'DONE').length;
  const progressPercentage = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  return {
    id: m.id,
    projectId: m.projectId,
    title: m.title,
    description: m.description,
    dueDate: m.dueDate?.toISOString() ?? null,
    status: m.status as MilestoneStatus,
    taskCount,
    completedTaskCount,
    progressPercentage,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export async function requireMilestoneAccess(milestoneId: string, userId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: { select: { id: true, workspaceId: true, status: true } },
      tasks: { select: { status: true } },
    },
  });

  if (!milestone) {
    throw Errors.notFound('Milestone not found.');
  }

  await requireProjectAccess(milestone.projectId, userId);

  return milestone;
}

export async function getProjectMilestones(
  projectId: string,
  userId: string
): Promise<MilestoneItem[]> {
  await requireProjectAccess(projectId, userId);

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    include: {
      tasks: { select: { status: true } },
    },
    orderBy: [
      { status: 'asc' },
      { dueDate: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'asc' },
    ],
  });

  return milestones.map(serializeMilestone);
}

export async function getMilestoneById(
  milestoneId: string,
  userId: string
): Promise<MilestoneItem> {
  const milestone = await requireMilestoneAccess(milestoneId, userId);
  return serializeMilestone(milestone);
}

export async function createMilestone(
  projectId: string,
  userId: string,
  data: CreateMilestoneData
): Promise<MilestoneItem> {
  await requireProjectManageAccess(projectId, userId);

  const milestone = await prisma.milestone.create({
    data: {
      projectId,
      title: data.title,
      description: data.description ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'OPEN',
    },
    include: {
      tasks: { select: { status: true } },
    },
  });

  return serializeMilestone(milestone);
}

export async function updateMilestone(
  milestoneId: string,
  userId: string,
  data: UpdateMilestoneData
): Promise<MilestoneItem> {
  const existing = await requireMilestoneAccess(milestoneId, userId);
  await requireProjectManageAccess(existing.projectId, userId);

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    include: {
      tasks: { select: { status: true } },
    },
  });

  return serializeMilestone(updated);
}

export async function deleteMilestone(
  milestoneId: string,
  userId: string
): Promise<{ id: string; success: boolean }> {
  const existing = await requireMilestoneAccess(milestoneId, userId);
  await requireProjectManageAccess(existing.projectId, userId);

  await prisma.milestone.delete({
    where: { id: milestoneId },
  });

  return { id: milestoneId, success: true };
}
