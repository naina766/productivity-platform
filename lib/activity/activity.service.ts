import { prisma } from '@/lib/db/prisma';
import { requireProjectAccess } from '@/lib/projects/permissions';
import type { Prisma } from '@prisma/client';
import type { ActivityItem, ActivityType } from '@/types/activity';

export interface LogActivityInput {
  projectId: string;
  taskId?: string | null;
  actorId: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, unknown> | null;
}

const activityInclude = {
  actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
  task: { select: { id: true, title: true } },
} as const;

/**
 * Append an activity entry. Takes a transaction client so the entry commits
 * atomically with the change it describes.
 */
export async function logActivity(
  tx: Prisma.TransactionClient,
  input: LogActivityInput,
): Promise<void> {
  await tx.activity.create({
    data: {
      projectId: input.projectId,
      taskId: input.taskId ?? null,
      actorId: input.actorId,
      type: input.type,
      message: input.message,
      ...(input.metadata ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
    },
  });
}

export async function getProjectActivity(
  projectId: string,
  userId: string,
  limit = 50,
  taskId?: string,
): Promise<ActivityItem[]> {
  await requireProjectAccess(projectId, userId);

  const activities = await prisma.activity.findMany({
    where: { projectId, ...(taskId ? { taskId } : {}) },
    include: activityInclude,
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  });

  return activities.map((a) => ({
    id: a.id,
    type: a.type as ActivityType,
    message: a.message,
    metadata: a.metadata as Record<string, unknown> | null,
    actor: a.actor,
    taskId: a.task?.id ?? null,
    taskTitle: a.task?.title ?? null,
    createdAt: a.createdAt.toISOString(),
  }));
}
