/**
 * NOVA — Comment service layer.
 *
 * Comments belong to a task, which belongs to a project, which belongs to a
 * workspace. Every operation verifies the full access chain via
 * `requireTaskAccess` before reading or writing, so ID manipulation never
 * leaks another workspace's data.
 *
 * Ownership rules:
 *  - Any project member may comment on a task.
 *  - Only the author may edit a comment.
 *  - The author OR a workspace ADMIN/OWNER (moderator) may delete a comment.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireTaskAccess } from '@/lib/tasks/permissions';
import { requireProjectManageAccess } from '@/lib/projects/permissions';
import { logActivity } from '@/lib/activity/activity.service';
import { createNotification } from '@/lib/notifications/notification.service';
import type { CommentItem } from '@/types/comment';

// ─── Safe author select (never expose passwordHash / tokens) ─────────────────

const safeAuthorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

type CommentWithAuthor = {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

function serializeComment(c: CommentWithAuthor): CommentItem {
  return {
    id: c.id,
    body: c.body,
    taskId: c.taskId,
    author: {
      id: c.author.id,
      name: c.author.name,
      email: c.author.email,
      avatarUrl: c.author.avatarUrl,
    },
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

// ─── Read operations ──────────────────────────────────────────────────────────

/**
 * List comments for a task (oldest first, natural conversation order).
 * Verifies the user can access the task.
 */
export async function getTaskComments(
  taskId: string,
  userId: string,
  limit = 100,
): Promise<CommentItem[]> {
  await requireTaskAccess(taskId, userId);

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: { author: { select: safeAuthorSelect } },
    orderBy: { createdAt: 'asc' },
    take: Math.min(Math.max(limit, 1), 500),
  });

  return comments.map(serializeComment);
}

// ─── Write operations ─────────────────────────────────────────────────────────

/**
 * Create a comment on a task.
 * Persists the comment + COMMENT_ADDED activity atomically, and notifies the
 * task assignee and other people who have commented (excluding the author).
 */
export async function createComment(
  taskId: string,
  userId: string,
  content: string,
): Promise<CommentItem> {
  const task = await requireTaskAccess(taskId, userId);

  const author = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  const authorName = author?.name ?? 'Someone';

  // Who should hear about this comment? The assignee plus everyone else who
  // has already commented, never the author themselves.
  const recipients = new Set<string>();
  if (task.assigneeId && task.assigneeId !== userId) {
    recipients.add(task.assigneeId);
  }
  if (recipients.size < 20) {
    const previousAuthors = await prisma.taskComment.findMany({
      where: { taskId, authorId: { not: userId } },
      select: { authorId: true },
      distinct: ['authorId'],
    });
    for (const p of previousAuthors) recipients.add(p.authorId);
  }

  const shortContent = content.length > 160 ? `${content.slice(0, 160)}…` : content;

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.taskComment.create({
      data: { taskId, authorId: userId, body: content },
      include: { author: { select: safeAuthorSelect } },
    });

    await logActivity(tx, {
      projectId: task.projectId,
      taskId,
      actorId: userId,
      type: 'COMMENT_ADDED',
      message: `Commented on "${task.title}"`,
      metadata: { title: task.title, commentId: created.id },
    });

    for (const recipientId of recipients) {
      await createNotification(tx, {
        userId: recipientId,
        taskId,
        title: task.assigneeId === recipientId ? 'New comment on your task' : 'New comment',
        body: `${authorName}: "${shortContent}"`,
      });
    }

    return created;
  });

  return serializeComment(comment);
}

/**
 * Find a comment and verify the caller can reach its task through
 * workspace → project → task. Shared by update/delete (avoids leaking the
 * existence of comments in workspaces the caller cannot access).
 */
async function requireCommentAccess(commentId: string, userId: string) {
  const comment = await prisma.taskComment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      body: true,
      taskId: true,
      authorId: true,
      task: { select: { projectId: true, title: true } },
    },
  });

  if (!comment) throw Errors.notFound('Comment not found.');

  await requireTaskAccess(comment.taskId, userId);

  return comment;
}

/**
 * Update a comment. Only the author may edit it.
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string,
): Promise<CommentItem> {
  const comment = await requireCommentAccess(commentId, userId);

  if (comment.authorId !== userId) {
    throw Errors.forbidden('You can only edit your own comments.');
  }

  const updated = await prisma.taskComment.update({
    where: { id: commentId },
    data: { body: content },
    include: { author: { select: safeAuthorSelect } },
  });

  return serializeComment(updated);
}

/**
 * Delete a comment.
 *  - The author may always delete their own comment.
 *  - Workspace ADMIN/OWNER may delete any comment in the project (moderation),
 *    mirroring the existing project-management permission convention.
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await requireCommentAccess(commentId, userId);

  const isAuthor = comment.authorId === userId;
  if (!isAuthor) {
    // Moderation: check ADMIN+ privileges on the project's workspace
    // (comments without a resolvable task cannot be moderated this way).
    await requireProjectManageAccess(comment.task.projectId, userId);
  }

  await prisma.taskComment.delete({ where: { id: commentId } });
}