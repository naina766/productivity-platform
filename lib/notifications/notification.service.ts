import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import type { Prisma } from '@prisma/client';
import type { NotificationItem } from '@/types/notification';

export interface CreateNotificationInput {
  userId: string;
  taskId?: string | null;
  title: string;
  body?: string | null;
}

const notificationInclude = {
  task: { select: { id: true, title: true, projectId: true } },
} as const;

type NotificationRow = Prisma.NotificationGetPayload<{ include: typeof notificationInclude }>;

/**
 * Persist a notification. Takes a transaction client so it commits together
 * with the mutation that triggered it.
 */
export async function createNotification(
  tx: Prisma.TransactionClient,
  input: CreateNotificationInput,
): Promise<void> {
  await tx.notification.create({
    data: {
      userId: input.userId,
      taskId: input.taskId ?? null,
      title: input.title,
      body: input.body ?? null,
    },
  });
}

function serializeNotification(n: NotificationRow): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    taskId: n.taskId,
    projectId: n.task?.projectId ?? null,
    taskTitle: n.task?.title ?? null,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function getUserNotifications(
  userId: string,
  options?: { unread?: boolean; limit?: number },
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const limit = Math.min(Math.max(Math.floor(options?.limit ?? 50), 1), 200);

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, ...(options?.unread ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: notificationInclude,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return { notifications: notifications.map(serializeNotification), unreadCount };
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  // Scoping the lookup by userId makes this a 404 for anyone else's
  // notification instead of an update that silently succeeds.
  const owned = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: { id: true },
  });
  if (!owned) throw Errors.notFound('Notification not found.');

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
