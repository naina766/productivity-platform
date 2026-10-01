import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireProjectAccess } from '@/lib/projects/permissions';

/**
 * Resolve a task and confirm the caller can reach it.
 *
 * Authorization walks the full chain — user → workspace membership → project →
 * task — so a task id from another workspace resolves to 404, not 403.
 */
export async function requireTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      assigneeId: true,
      milestoneId: true,
      position: true,
      isRecurring: true,
      recurrenceInterval: true,
      recurrenceEndDate: true,
      recurringParentId: true,
      labels: { select: { labelId: true } },
      subtasks: { select: { title: true, position: true } },
      createdAt: true,
      updatedAt: true,
      project: { select: { id: true, workspaceId: true, status: true } },
    },
  });
  if (!task) throw Errors.notFound('Task not found.');

  await requireProjectAccess(task.project.id, userId);

  return task;
}

/** An assignee must already be a ProjectMember of the target project. */
export async function requireValidAssignee(projectId: string, assigneeId: string): Promise<void> {
  const projectMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
    select: { id: true },
  });

  if (!projectMember) {
    throw Errors.validation('Assignee must be a member of this project.');
  }
}

/**
 * Labels are workspace-scoped, so every id must belong to the task's workspace.
 * A partial match is rejected rather than silently dropping the unknown ids.
 */
export async function requireValidWorkspaceLabels(
  workspaceId: string,
  labelIds: string[],
): Promise<void> {
  const uniqueLabelIds = Array.from(new Set(labelIds));
  if (uniqueLabelIds.length === 0) return;

  const count = await prisma.label.count({
    where: { workspaceId, id: { in: uniqueLabelIds } },
  });

  if (count !== uniqueLabelIds.length) {
    throw Errors.badRequest('One or more labels are invalid or do not belong to this workspace.');
  }
}
