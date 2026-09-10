/**
 * NOVA — Activity service layer.
 *
 * Records structured project activity (task created, status changes,
 * assignments, comments, project events) and lists it for a project.
 * The `logActivity` helper is transaction-aware so mutations and their
 * activity entries commit atomically.
 */

import { prisma } from '@/lib/db/prisma';
import { requireProjectAccess } from '@/lib/projects/permissions';
import type { ActivityItem, ActivityType } from '@/types/activity';
import type { ActivityType as PrismaActivityType, Prisma } from '@prisma/client';

const safeActorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

export interface LogActivityInput {
  projectId: string;
  taskId?: string | null;
  actorId: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Persist an activity entry. Accepts a transaction client so it can be
 * composed with the mutation that triggered the event.
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
      type: input.type as PrismaActivityType,
      message: input.message,
      metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
    },
  });
}

/**
 * List activity for a project (newest first).
 * Optionally filtered to a single task. Verifies the user has project access.
 */
export async function getProjectActivity(
  projectId: string,
  userId: string,
  limit = 50,
  taskId?: string,
): Promise<ActivityItem[]> {
  await requireProjectAccess(projectId, userId);

  const activities = await prisma.activity.findMany({
    where: { projectId, ...(taskId ? { taskId } : {}) },
    include: {
      actor: { select: safeActorSelect },
      task: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  });

  return activities.map((a) => ({
    id: a.id,
    type: a.type as ActivityType,
    message: a.message,
    metadata: a.metadata as Record<string, unknown> | null,
    actor: a.actor
      ? {
          id: a.actor.id,
          name: a.actor.name,
          email: a.actor.email,
          avatarUrl: a.actor.avatarUrl,
        }
      : null,
    taskId: a.task?.id,
    taskTitle: a.task?.title ?? null,
    createdAt: a.createdAt.toISOString(),
  }));
}