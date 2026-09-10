/**
 * NOVA — Task-level authorization helpers.
 *
 * Reuses the project/workspace permission architecture.
 * Every task operation verifies the full chain:
 *   user → workspace membership → project access → task belongs to project.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireProjectAccess } from '@/lib/projects/permissions';

/**
 * Verify the task exists and belongs to a project the user can access.
 * Returns the task with project workspace info, or throws 404.
 * Never reveals the existence of tasks in other workspaces.
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
      position: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: { id: true, workspaceId: true, status: true },
      },
    },
  });

  if (!task) throw Errors.notFound('Task not found.');

  // Verify user has access to the task's project (which also verifies workspace membership).
  await requireProjectAccess(task.project.id, userId);

  return task;
}

/**
 * Verify the assignee is a member of the same project.
 * Target user must exist, belong to the workspace, and be a project member.
 */
export async function requireValidAssignee(
  projectId: string,
  workspaceId: string,
  assigneeId: string,
): Promise<void> {
  // Check project membership (which also implies workspace membership).
  const projectMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
  });

  if (!projectMember) {
    throw Errors.validation('Assignee must be a member of this project.');
  }
}
