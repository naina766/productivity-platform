/**
 * NOVA — Notifications service layer.
 *
 * In-app notifications keyed to a task. Kept deliberately small:
 * notifications are only created for genuinely useful events (task
 * assignment and new comments), never for every status change.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import type { NotificationItem } from '@/types/notification';
import type { Prisma } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  taskId?: string | null;
  title: string;
  body?: string | null;
}

/**
 * Persist a notification. Accepts a transaction client so it can be
 * composed with the mutation that triggered it.
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

function serializeNotification(n: {
  id: string;
  taskId: string | null;
  title: string;
  body: string | null;
  readAt: Date | null;
  createdAt: Date;
  task: { title: string; projectId: string } | null;
}): NotificationItem {
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

/**
 * List the current user's notifications (newest first) plus an unread count.
 * Optional `unread` filter and `limit` cap (defaults to 50).
 */
export async function getUserNotifications(
  userId: string,
  options?: { unread?: boolean; limit?: number },
): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const limit = Math.min(Math.max(Math.floor(options?.limit ?? 50), 1), 200);

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, ...(options?.unread ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        task: { select: { id: true, title: true, projectId: true } },
      },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    unreadCount,
  };
}

/**
 * Lightweight unread count for the navbar bell (one indexed query).
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

/**
 * Mark a single notification as read. Only the owner can read their own.
 * IDOR-safe: returns 404 when the notification is not found or not owned.
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: { id: true },
  });

  if (!notification) throw Errors.notFound('Notification not found.');

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

/**
 * Mark every notification for the user as read.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}