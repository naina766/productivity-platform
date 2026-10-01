import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireTaskAccess } from '@/lib/tasks/permissions';
import { requireProjectManageAccess } from '@/lib/projects/permissions';
import { logActivity } from '@/lib/activity/activity.service';
import { createNotification } from '@/lib/notifications/notification.service';
import { extractMentionStrings } from './mentions';
import type { Prisma } from '@prisma/client';
import type { CommentItem } from '@/types/comment';

const commentInclude = {
  author: { select: { id: true, name: true, email: true, avatarUrl: true } },
} as const;

type CommentRow = Prisma.TaskCommentGetPayload<{ include: typeof commentInclude }>;

function serializeComment(c: CommentRow): CommentItem {
  return {
    id: c.id,
    body: c.body,
    taskId: c.taskId,
    author: c.author,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/** Max recipients per comment, so a busy thread cannot fan out unbounded. */
const MAX_COMMENT_RECIPIENTS = 20;

export async function getTaskComments(
  taskId: string,
  userId: string,
  limit = 100,
): Promise<CommentItem[]> {
  await requireTaskAccess(taskId, userId);

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
    take: Math.min(Math.max(limit, 1), 500),
  });

  return comments.map(serializeComment);
}

/**
 * Post a comment and notify the people already involved in the task.
 *
 * The assignee and previous commenters are notified (never the author), and
 * the comment plus its notifications commit together with the activity entry.
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

  const recipients = new Set<string>();
  if (task.assigneeId && task.assigneeId !== userId) {
    recipients.add(task.assigneeId);
  }
  if (recipients.size < MAX_COMMENT_RECIPIENTS) {
    const previousAuthors = await prisma.taskComment.findMany({
      where: { taskId, authorId: { not: userId } },
      select: { authorId: true },
      distinct: ['authorId'],
    });
    for (const previous of previousAuthors) recipients.add(previous.authorId);
  }

  const excerpt = content.length > 160 ? `${content.slice(0, 160)}…` : content;

  // Extract mentions from content
  const mentionStrings = extractMentionStrings(content);
  const mentionedUserIds = new Set<string>();

  if (mentionStrings.length > 0) {
    // Find project and workspace members who match these mention tokens
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: task.projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    for (const member of projectMembers) {
      if (member.userId === userId) continue;
      const lowerName = member.user.name.toLowerCase();
      const lowerEmail = member.user.email.toLowerCase();
      const firstName = lowerName.split(' ')[0] ?? '';

      const isMentioned = mentionStrings.some(
        (m) =>
          lowerName === m ||
          lowerEmail === m ||
          firstName === m ||
          lowerName.includes(m)
      );

      if (isMentioned) {
        mentionedUserIds.add(member.userId);
      }
    }
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.taskComment.create({
      data: { taskId, authorId: userId, body: content },
      include: commentInclude,
    });

    await logActivity(tx, {
      projectId: task.projectId,
      taskId,
      actorId: userId,
      type: 'COMMENT_ADDED',
      message: `Commented on "${task.title}"`,
      metadata: { title: task.title, commentId: created.id },
    });

    // Notify directly mentioned users with targeted message
    for (const mentionedId of mentionedUserIds) {
      await createNotification(tx, {
        userId: mentionedId,
        taskId,
        title: `${authorName} mentioned you on "${task.title}"`,
        body: `${authorName}: "${excerpt}"`,
      });
    }

    // Notify remaining recipients (assignee, previous commenters)
    for (const recipientId of recipients) {
      if (mentionedUserIds.has(recipientId)) continue;
      await createNotification(tx, {
        userId: recipientId,
        taskId,
        title: task.assigneeId === recipientId ? 'New comment on your task' : 'New comment',
        body: `${authorName}: "${excerpt}"`,
      });
    }

    return created;
  });

  return serializeComment(comment);
}

/**
 * Resolve a comment through its task so edit and delete apply the same
 * workspace → project → task access chain as every other comment operation.
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
    include: commentInclude,
  });

  return serializeComment(updated);
}

/** The author may delete their own comment; workspace ADMIN+ may moderate any comment. */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await requireCommentAccess(commentId, userId);

  if (comment.authorId !== userId) {
    await requireProjectManageAccess(comment.task.projectId, userId);
  }

  await prisma.taskComment.delete({ where: { id: commentId } });
}
