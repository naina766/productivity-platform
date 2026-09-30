/**
 * NOVA — Task service layer.
 *
 * All task business logic lives here. Route handlers are kept thin.
 * Authorization is enforced before any DB write via permissions helpers.
 */

import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireProjectAccess, requireProjectManageAccess } from '@/lib/projects/permissions';
import { requireTaskAccess, requireValidAssignee, requireValidWorkspaceLabels } from '@/lib/tasks/permissions';
import { logActivity } from '@/lib/activity/activity.service';
import { createNotification } from '@/lib/notifications/notification.service';
import { TASK_STATUS_LABELS } from '@/types/task';
import type { CreateTaskData, UpdateTaskData } from '@/lib/validations/task';
import type {
  TaskSummary,
  TaskDetail,
  TaskFilters,
  TaskSort,
} from '@/types/task';
import { Prisma, type Task } from '@prisma/client';

// ─── Safe field selects ─────────────────────────────────────────────────────

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

const taskInclude = {
  assignee: { select: safeUserSelect },
  labels: {
    select: {
      label: { select: { id: true, name: true, color: true } },
    },
  },
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function serializeDate(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function serializeTask(task: Task & { assignee: { id: string; name: string; email: string; avatarUrl: string | null } | null; labels: { label: { id: string; name: string; color: string } }[] }): TaskSummary {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status as TaskSummary['status'],
    priority: task.priority as TaskSummary['priority'],
    dueDate: serializeDate(task.dueDate),
    assigneeId: task.assigneeId,
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          avatarUrl: task.assignee.avatarUrl,
        }
      : null,
    position: task.position,
    labels: task.labels.map((tl) => ({
      id: tl.label.id,
      name: tl.label.name,
      color: tl.label.color,
    })),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

// ─── Read operations ─────────────────────────────────────────────────────────

/**
 * List tasks for a project with optional filters.
 * Verifies the user has access to the project.
 */
export async function getProjectTasks(
  projectId: string,
  userId: string,
  filters?: TaskFilters,
  sort?: TaskSort,
): Promise<TaskSummary[]> {
  await requireProjectAccess(projectId, userId);

  const where: Prisma.TaskWhereInput = { projectId };

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.priority) {
    where.priority = filters.priority;
  }
  if (filters?.assigneeId) {
    where.assigneeId = filters.assigneeId === 'unassigned' ? null : filters.assigneeId;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.TaskOrderByWithRelationInput;
  switch (sort) {
    case 'updatedAt':
      orderBy = { updatedAt: 'desc' };
      break;
    case 'dueDate':
      orderBy = { dueDate: { sort: 'asc', nulls: 'last' } };
      break;
    case 'priority': {
      // Sort by priority rank: URGENT > HIGH > MEDIUM > LOW
      orderBy = { priority: 'desc' };
      break;
    }
    case 'position':
      orderBy = { position: 'asc' };
      break;
    case 'createdAt':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy,
  });

  return tasks.map(serializeTask);
}

/**
 * Get a single task by ID.
 * Verifies the user has access through workspace → project chain.
 */
export async function getTaskById(
  taskId: string,
  userId: string,
): Promise<TaskDetail> {
  const task = await requireTaskAccess(taskId, userId);

  const fullTask = await prisma.task.findUnique({
    where: { id: task.id },
    include: taskInclude,
  });

  if (!fullTask) throw Errors.notFound('Task not found.');

  return serializeTask(fullTask);
}

// ─── Write operations ────────────────────────────────────────────────────────

/**
 * Create a task within a project.
 * Verifies project access and assignee validity.
 * Persists the task + TASK_CREATED activity atomically, and notifies the
 * assignee when one is set by the creator.
 */
export async function createTask(
  projectId: string,
  userId: string,
  data: CreateTaskData,
): Promise<TaskDetail> {
  const { project } = await requireProjectAccess(projectId, userId);

  // Validate assignee if provided
  if (data.assigneeId) {
    await requireValidAssignee(projectId, project.workspaceId, data.assigneeId);
  }

  // Validate labels belong to the project workspace if provided
  if (data.labelIds && data.labelIds.length > 0) {
    await requireValidWorkspaceLabels(project.workspaceId, data.labelIds);
  }

  // Get next position value
  const maxPosition = await prisma.task.aggregate({
    where: { projectId },
    _max: { position: true },
  });
  const nextPosition = (maxPosition._max.position ?? -1) + 1;

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'TODO',
        priority: data.priority ?? 'MEDIUM',
        assigneeId: data.assigneeId ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        position: nextPosition,
        // Connect labels if provided
        ...(data.labelIds && data.labelIds.length > 0
          ? {
              labels: {
                create: data.labelIds.map((labelId) => ({
                  label: { connect: { id: labelId } },
                })),
              },
            }
          : {}),
      },
      include: taskInclude,
    });

    await logActivity(tx, {
      projectId,
      taskId: created.id,
      actorId: userId,
      type: 'TASK_CREATED',
      message: `Created task "${data.title}"`,
      metadata: { title: data.title },
    });

    // Notify the assignee they were handed a new task (never the creator).
    if (created.assigneeId && created.assigneeId !== userId) {
      await createNotification(tx, {
        userId: created.assigneeId,
        taskId: created.id,
        title: 'Task assigned to you',
        body: `"${data.title}" was assigned to you.`,
      });
    }

    return created;
  });

  return serializeTask(task);
}

/**
 * Update a task and persist the meaningful collaboration events that result:
 *  - status change         → TASK_STATUS_CHANGED / TASK_COMPLETED activity
 *  - assignee change       → TASK_ASSIGNED activity + notification
 *  - completion            → notification to the current assignee
 * All writes commit in a single transaction so activity/notifications can
 * never go stale relative to the mutation they describe.
 */
export async function updateTask(
  taskId: string,
  userId: string,
  data: UpdateTaskData,
): Promise<TaskDetail> {
  const task = await requireTaskAccess(taskId, userId);

  // Validate assignee if being changed
  if (data.assigneeId !== undefined && data.assigneeId !== null) {
    await requireValidAssignee(
      task.projectId,
      task.project.workspaceId,
      data.assigneeId,
    );
  }

  // Validate labels belong to the project workspace if being changed
  if (data.labelIds && data.labelIds.length > 0) {
    await requireValidWorkspaceLabels(task.project.workspaceId, data.labelIds);
  }

  const beforeStatus = task.status;
  const beforeAssignee = task.assigneeId;

  const statusChanged = data.status !== undefined && data.status !== beforeStatus;
  const completed = statusChanged && data.status === 'DONE';
  const assigneeChanged = 'assigneeId' in data && data.assigneeId !== beforeAssignee;
  const afterAssignee = assigneeChanged ? (data.assigneeId ?? null) : beforeAssignee;

  // Resolve the display name of a newly assigned member for readable messages.
  let assigneeName: string | null = null;
  if (assigneeChanged && afterAssignee) {
    const assigned = await prisma.user.findUnique({
      where: { id: afterAssignee },
      select: { name: true },
    });
    assigneeName = assigned?.name ?? null;
  }

  // Status change with no explicit position → append to the destination
  // column so Kanban ordering stays stable.
  let nextPosition: number | null = null;
  if (statusChanged && data.position === undefined && data.status) {
    const maxPosition = await prisma.task.aggregate({
      where: { projectId: task.projectId, status: data.status },
      _max: { position: true },
    });
    nextPosition = (maxPosition._max.position ?? -1) + 1;
  }

  await prisma.$transaction(async (tx) => {
    const updateData: Prisma.TaskUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if ('assigneeId' in data) {
      updateData.assignee = data.assigneeId
        ? { connect: { id: data.assigneeId } }
        : { disconnect: true };
    }
    if ('dueDate' in data) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.position !== undefined) updateData.position = data.position;
    else if (nextPosition !== null) updateData.position = nextPosition;

    // Handle label updates inside the same transaction.
    if (data.labelIds !== undefined) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      if (data.labelIds.length > 0) {
        await tx.taskLabel.createMany({
          data: data.labelIds.map((labelId) => ({ taskId, labelId })),
        });
      }
    }

    await tx.task.update({ where: { id: taskId }, data: updateData });

    // ── Activity events ───────────────────────────────────────────────────
    if (statusChanged) {
      await logActivity(tx, {
        projectId: task.projectId,
        taskId,
        actorId: userId,
        type: completed ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED',
        message: completed
          ? `Moved "${task.title}" to Done`
          : `Moved "${task.title}" from ${TASK_STATUS_LABELS[beforeStatus]} to ${TASK_STATUS_LABELS[data.status!]}`,
        metadata: { title: task.title, from: beforeStatus, to: data.status },
      });
    }

    if (assigneeChanged) {
      await logActivity(tx, {
        projectId: task.projectId,
        taskId,
        actorId: userId,
        type: 'TASK_ASSIGNED',
        message: afterAssignee
          ? `Assigned "${task.title}" to ${assigneeName ?? 'a member'}`
          : `Removed the assignee from "${task.title}"`,
        metadata: { title: task.title, assigneeId: afterAssignee },
      });
    }

    // ── Notifications (only genuinely useful events) ─────────────────────
    if (assigneeChanged && afterAssignee && afterAssignee !== userId) {
      await createNotification(tx, {
        userId: afterAssignee,
        taskId,
        title: 'Task assigned to you',
        body: `"${task.title}" was assigned to you.`,
      });
    }

    if (completed && afterAssignee && afterAssignee !== userId) {
      await createNotification(tx, {
        userId: afterAssignee,
        taskId,
        title: 'Task completed',
        body: `"${task.title}" was marked as done.`,
      });
    }
  });

  const updated = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude,
  });

  return serializeTask(updated!);
}

/**
 * Delete a task permanently.
 * Requires task access plus project management rights (workspace ADMIN+),
 * consistent with the existing project permission model.
 */
export async function deleteTask(
  taskId: string,
  userId: string,
): Promise<void> {
  const task = await requireTaskAccess(taskId, userId);

  // Restrict deletion: verifies the caller holds ADMIN+ in the task's workspace.
  await requireProjectManageAccess(task.projectId, userId);

  await prisma.task.delete({ where: { id: taskId } });
}
