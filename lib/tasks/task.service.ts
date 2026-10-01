import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireProjectAccess, requireProjectManageAccess } from '@/lib/projects/permissions';
import { requireTaskAccess, requireValidAssignee, requireValidWorkspaceLabels } from '@/lib/tasks/permissions';
import { logActivity } from '@/lib/activity/activity.service';
import { createNotification } from '@/lib/notifications/notification.service';
import { calculateNextOccurrence, shouldSpawnNextOccurrence } from './recurring';
import { eventBus } from '@/lib/realtime/event-bus';
import { TASK_STATUS_LABELS } from '@/types/task';
import type { Prisma } from '@prisma/client';
import type { CreateTaskData, UpdateTaskData } from '@/lib/validations/task';
import type { TaskSummary, TaskFilters, TaskSort } from '@/types/task';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  labels: { select: { label: { select: { id: true, name: true, color: true } } } },
  milestone: { select: { id: true, title: true, status: true } },
  subtasks: {
    select: {
      id: true,
      taskId: true,
      title: true,
      isCompleted: true,
      position: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.TaskInclude;

type TaskRow = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

export function serializeTask(task: TaskRow): TaskSummary {
  const subtasks = task.subtasks?.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    isCompleted: s.isCompleted,
    position: s.position,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  })) ?? [];

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status as TaskSummary['status'],
    priority: task.priority as TaskSummary['priority'],
    dueDate: task.dueDate?.toISOString() ?? null,
    assigneeId: task.assigneeId,
    assignee: task.assignee,
    milestoneId: task.milestoneId,
    milestone: task.milestone
      ? {
          id: task.milestone.id,
          title: task.milestone.title,
          status: task.milestone.status as 'OPEN' | 'COMPLETED',
        }
      : null,
    position: task.position,
    labels: task.labels.map((tl) => tl.label),
    isRecurring: task.isRecurring,
    recurrenceInterval: task.recurrenceInterval,
    recurrenceEndDate: task.recurrenceEndDate?.toISOString() ?? null,
    recurringParentId: task.recurringParentId,
    subtaskCount: subtasks.length,
    completedSubtaskCount: subtasks.filter((s) => s.isCompleted).length,
    subtasks,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

const SORT_ORDER: Record<TaskSort, Prisma.TaskOrderByWithRelationInput> = {
  createdAt: { createdAt: 'desc' },
  updatedAt: { updatedAt: 'desc' },
  dueDate: { dueDate: { sort: 'asc', nulls: 'last' } },
  // Postgres orders enums by declaration order, so descending yields
  // URGENT > HIGH > MEDIUM > LOW.
  priority: { priority: 'desc' },
  position: { position: 'asc' },
};

export async function getProjectTasks(
  projectId: string,
  userId: string,
  filters?: TaskFilters,
  sort?: TaskSort,
): Promise<TaskSummary[]> {
  await requireProjectAccess(projectId, userId);

  const where: Prisma.TaskWhereInput = { projectId };
  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.assigneeId) {
    where.assigneeId = filters.assigneeId === 'unassigned' ? null : filters.assigneeId;
  }
  if (filters?.milestoneId) {
    where.milestoneId = filters.milestoneId === 'none' ? null : filters.milestoneId;
  }
  if (filters?.isRecurring !== undefined) {
    where.isRecurring = filters.isRecurring;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: SORT_ORDER[sort ?? 'position'],
  });

  return tasks.map(serializeTask);
}

export async function getTaskById(taskId: string, userId: string): Promise<TaskSummary> {
  await requireTaskAccess(taskId, userId);

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
  if (!task) throw Errors.notFound('Task not found.');

  return serializeTask(task);
}

export async function createTask(
  projectId: string,
  userId: string,
  data: CreateTaskData,
): Promise<TaskSummary> {
  const { project } = await requireProjectAccess(projectId, userId);

  if (data.assigneeId) {
    await requireValidAssignee(projectId, data.assigneeId);
  }
  if (data.labelIds?.length) {
    await requireValidWorkspaceLabels(project.workspaceId, data.labelIds);
  }

  // New tasks land at the end of the board.
  const { _max } = await prisma.task.aggregate({
    where: { projectId },
    _max: { position: true },
  });

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'TODO',
        priority: data.priority ?? 'MEDIUM',
        assigneeId: data.assigneeId ?? null,
        milestoneId: data.milestoneId ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        isRecurring: data.isRecurring ?? false,
        recurrenceInterval: data.isRecurring ? data.recurrenceInterval ?? null : null,
        recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null,
        position: (_max.position ?? -1) + 1,
        ...(data.labelIds?.length
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

  const serialized = serializeTask(task);
  eventBus.publish(project.workspaceId, {
    type: 'TASK_CREATED',
    projectId: task.projectId,
    actorId: userId,
    data: serialized,
  });

  if (task.assigneeId && task.assigneeId !== userId) {
    eventBus.publish(project.workspaceId, {
      type: 'NOTIFICATION_CREATED',
      projectId: task.projectId,
      actorId: userId,
      data: { userId: task.assigneeId },
    });
  }

  return serialized;
}

/**
 * Update a task and record the collaboration events it produces.
 *
 * The task row, its activity entries, and its notifications are written in a
 * single transaction, so the timeline can never disagree with the task state.
 */
export async function updateTask(
  taskId: string,
  userId: string,
  data: UpdateTaskData,
): Promise<TaskSummary> {
  const task = await requireTaskAccess(taskId, userId);

  if (data.assigneeId) {
    await requireValidAssignee(task.projectId, data.assigneeId);
  }
  if (data.labelIds?.length) {
    await requireValidWorkspaceLabels(task.project.workspaceId, data.labelIds);
  }

  const statusChanged = data.status !== undefined && data.status !== task.status;
  const assigneeChanged = 'assigneeId' in data && data.assigneeId !== task.assigneeId;
  const completed = statusChanged && data.status === 'DONE';
  const nextAssignee = assigneeChanged ? data.assigneeId : task.assigneeId;

  let assigneeName: string | null = null;
  if (assigneeChanged && nextAssignee) {
    const assigned = await prisma.user.findUnique({
      where: { id: nextAssignee },
      select: { name: true },
    });
    assigneeName = assigned?.name ?? null;
  }

  // A task dropped into another column is appended to that column so board
  // ordering stays predictable without a drag-reordering data model.
  let nextPosition: number | undefined;
  if (statusChanged && data.position === undefined && data.status) {
    const { _max } = await prisma.task.aggregate({
      where: { projectId: task.projectId, status: data.status },
      _max: { position: true },
    });
    nextPosition = (_max.position ?? -1) + 1;
  }

  await prisma.$transaction(async (tx) => {
    const updateData: Prisma.TaskUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if ('assigneeId' in data) {
      updateData.assignee = data.assigneeId ? { connect: { id: data.assigneeId } } : { disconnect: true };
    }
    if ('milestoneId' in data) {
      updateData.milestone = data.milestoneId ? { connect: { id: data.milestoneId } } : { disconnect: true };
    }
    if ('dueDate' in data) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.position !== undefined) updateData.position = data.position;
    else if (nextPosition !== undefined) updateData.position = nextPosition;

    if (data.isRecurring !== undefined) {
      updateData.isRecurring = data.isRecurring;
      if (!data.isRecurring) {
        updateData.recurrenceInterval = null;
        updateData.recurrenceEndDate = null;
      }
    }
    if ('recurrenceInterval' in data) {
      updateData.recurrenceInterval = data.recurrenceInterval ?? null;
    }
    if ('recurrenceEndDate' in data) {
      updateData.recurrenceEndDate = data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null;
    }

    if (data.labelIds !== undefined) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      if (data.labelIds.length > 0) {
        await tx.taskLabel.createMany({
          data: data.labelIds.map((labelId) => ({ taskId, labelId })),
        });
      }
    }

    await tx.task.update({ where: { id: taskId }, data: updateData });

    if (statusChanged) {
      await logActivity(tx, {
        projectId: task.projectId,
        taskId,
        actorId: userId,
        type: completed ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED',
        message: completed
          ? `Moved "${task.title}" to Done`
          : `Moved "${task.title}" from ${TASK_STATUS_LABELS[task.status]} to ${TASK_STATUS_LABELS[data.status!]}`,
        metadata: { title: task.title, from: task.status, to: data.status },
      });
    }

    if (assigneeChanged) {
      await logActivity(tx, {
        projectId: task.projectId,
        taskId,
        actorId: userId,
        type: 'TASK_ASSIGNED',
        message: nextAssignee
          ? `Assigned "${task.title}" to ${assigneeName ?? 'a member'}`
          : `Removed the assignee from "${task.title}"`,
        metadata: { title: task.title, assigneeId: nextAssignee },
      });
    }

    if (assigneeChanged && nextAssignee && nextAssignee !== userId) {
      await createNotification(tx, {
        userId: nextAssignee,
        taskId,
        title: 'Task assigned to you',
        body: `"${task.title}" was assigned to you.`,
      });
    }

    if (completed && nextAssignee && nextAssignee !== userId) {
      await createNotification(tx, {
        userId: nextAssignee,
        taskId,
        title: 'Task completed',
        body: `"${task.title}" was marked as done.`,
      });
    }

    if (completed && task.isRecurring && task.recurrenceInterval) {
      const nextDueDate = calculateNextOccurrence(task.dueDate, task.recurrenceInterval);
      if (shouldSpawnNextOccurrence(nextDueDate, task.recurrenceEndDate)) {
        const { _max: todoMax } = await tx.task.aggregate({
          where: { projectId: task.projectId, status: 'TODO' },
          _max: { position: true },
        });
        const nextPos = (todoMax.position ?? -1) + 1;

        const nextRecurringTask = await tx.task.create({
          data: {
            projectId: task.projectId,
            title: task.title,
            description: task.description,
            status: 'TODO',
            priority: task.priority,
            assigneeId: task.assigneeId,
            milestoneId: task.milestoneId,
            dueDate: nextDueDate,
            position: nextPos,
            isRecurring: true,
            recurrenceInterval: task.recurrenceInterval,
            recurrenceEndDate: task.recurrenceEndDate,
            recurringParentId: task.recurringParentId ?? task.id,
            ...(task.labels.length > 0
              ? {
                  labels: {
                    create: task.labels.map((tl) => ({ labelId: tl.labelId })),
                  },
                }
              : {}),
            ...(task.subtasks.length > 0
              ? {
                  subtasks: {
                    create: task.subtasks.map((st) => ({
                      title: st.title,
                      isCompleted: false,
                      position: st.position,
                    })),
                  },
                }
              : {}),
          },
        });

        await logActivity(tx, {
          projectId: task.projectId,
          taskId: nextRecurringTask.id,
          actorId: userId,
          type: 'TASK_CREATED',
          message: `Created next recurring task "${nextRecurringTask.title}"`,
          metadata: { recurringParentId: task.id, nextDueDate: nextDueDate.toISOString() },
        });
      }
    }
  });

  const updated = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
  if (!updated) throw Errors.notFound('Task not found.');

  const serialized = serializeTask(updated);
  eventBus.publish(task.project.workspaceId, {
    type: 'TASK_UPDATED',
    projectId: task.projectId,
    actorId: userId,
    data: serialized,
  });

  if (assigneeChanged && nextAssignee && nextAssignee !== userId) {
    eventBus.publish(task.project.workspaceId, {
      type: 'NOTIFICATION_CREATED',
      projectId: task.projectId,
      actorId: userId,
      data: { userId: nextAssignee },
    });
  }

  if (completed && nextAssignee && nextAssignee !== userId) {
    eventBus.publish(task.project.workspaceId, {
      type: 'NOTIFICATION_CREATED',
      projectId: task.projectId,
      actorId: userId,
      data: { userId: nextAssignee },
    });
  }

  return serialized;
}

/** Deleting a task removes its comments, labels, and activity via cascade. */
export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const task = await requireTaskAccess(taskId, userId);
  await requireProjectManageAccess(task.projectId, userId);

  await prisma.task.delete({ where: { id: taskId } });

  eventBus.publish(task.project.workspaceId, {
    type: 'TASK_DELETED',
    projectId: task.projectId,
    actorId: userId,
    data: { taskId, projectId: task.projectId },
  });
}
