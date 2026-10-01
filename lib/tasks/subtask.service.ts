import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireProjectAccess } from '@/lib/projects/permissions';
import { requireTaskAccess } from '@/lib/tasks/permissions';
import type { CreateSubtaskData, UpdateSubtaskData } from '@/lib/validations/subtask';
import type { SubtaskItem } from '@/types/task';

export function serializeSubtask(s: {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}): SubtaskItem {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    isCompleted: s.isCompleted,
    position: s.position,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function requireSubtaskAccess(subtaskId: string, userId: string) {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    select: {
      id: true,
      taskId: true,
      title: true,
      isCompleted: true,
      position: true,
      createdAt: true,
      updatedAt: true,
      task: {
        select: {
          id: true,
          projectId: true,
          project: { select: { id: true, workspaceId: true } },
        },
      },
    },
  });

  if (!subtask) {
    throw Errors.notFound('Subtask not found.');
  }

  await requireProjectAccess(subtask.task.project.id, userId);

  return subtask;
}

export async function getSubtasks(taskId: string, userId: string): Promise<SubtaskItem[]> {
  await requireTaskAccess(taskId, userId);

  const subtasks = await prisma.subtask.findMany({
    where: { taskId },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });

  return subtasks.map(serializeSubtask);
}

export async function createSubtask(
  taskId: string,
  userId: string,
  data: CreateSubtaskData
): Promise<SubtaskItem> {
  await requireTaskAccess(taskId, userId);

  // Position at the end
  const currentCount = await prisma.subtask.count({ where: { taskId } });

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title: data.title,
      isCompleted: data.isCompleted ?? false,
      position: currentCount,
    },
  });

  return serializeSubtask(subtask);
}

export async function updateSubtask(
  subtaskId: string,
  userId: string,
  data: UpdateSubtaskData
): Promise<SubtaskItem> {
  await requireSubtaskAccess(subtaskId, userId);

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted } : {}),
      ...(data.position !== undefined ? { position: data.position } : {}),
    },
  });

  return serializeSubtask(updated);
}

export async function deleteSubtask(
  subtaskId: string,
  userId: string
): Promise<{ id: string; success: boolean }> {
  await requireSubtaskAccess(subtaskId, userId);

  await prisma.subtask.delete({
    where: { id: subtaskId },
  });

  return { id: subtaskId, success: true };
}
