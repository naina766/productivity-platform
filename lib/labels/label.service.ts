import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import { requireWorkspaceMember, requireWorkspaceRole } from '@/lib/workspaces/permissions';
import type { CreateLabelData, UpdateLabelData } from '@/lib/validations/label';

export interface LabelItem {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: string;
}

function serializeLabel(label: {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: Date;
}): LabelItem {
  return {
    id: label.id,
    workspaceId: label.workspaceId,
    name: label.name,
    color: label.color,
    createdAt: label.createdAt.toISOString(),
  };
}

/** Reading labels needs workspace membership; changing them needs ADMIN or OWNER. */
export async function listWorkspaceLabels(
  workspaceId: string,
  userId: string,
): Promise<LabelItem[]> {
  await requireWorkspaceMember(workspaceId, userId);

  const labels = await prisma.label.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
  });

  return labels.map(serializeLabel);
}

export async function createWorkspaceLabel(
  workspaceId: string,
  userId: string,
  data: CreateLabelData,
): Promise<LabelItem> {
  await requireWorkspaceRole(workspaceId, userId, 'ADMIN');

  const existing = await prisma.label.findFirst({
    where: { workspaceId, name: { equals: data.name, mode: 'insensitive' } },
  });
  if (existing) {
    throw Errors.conflict('A label with this name already exists in this workspace.');
  }

  const created = await prisma.label.create({
    data: { workspaceId, name: data.name, color: data.color ?? '#22C55E' },
  });

  return serializeLabel(created);
}

export async function updateWorkspaceLabel(
  workspaceId: string,
  labelId: string,
  userId: string,
  data: UpdateLabelData,
): Promise<LabelItem> {
  await requireWorkspaceRole(workspaceId, userId, 'ADMIN');

  const label = await prisma.label.findFirst({ where: { id: labelId, workspaceId } });
  if (!label) {
    throw Errors.notFound('Label not found in this workspace.');
  }

  // Renaming into an existing name is a conflict, so re-check before writing.
  if (data.name && data.name.toLowerCase() !== label.name.toLowerCase()) {
    const existing = await prisma.label.findFirst({
      where: {
        workspaceId,
        id: { not: labelId },
        name: { equals: data.name, mode: 'insensitive' },
      },
    });
    if (existing) {
      throw Errors.conflict('A label with this name already exists in this workspace.');
    }
  }

  const updated = await prisma.label.update({
    where: { id: labelId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
  });

  return serializeLabel(updated);
}

/** Deleting a label cascades its TaskLabel join rows. */
export async function deleteWorkspaceLabel(
  workspaceId: string,
  labelId: string,
  userId: string,
): Promise<{ id: string; success: true }> {
  await requireWorkspaceRole(workspaceId, userId, 'ADMIN');

  const label = await prisma.label.findFirst({ where: { id: labelId, workspaceId } });
  if (!label) {
    throw Errors.notFound('Label not found in this workspace.');
  }

  await prisma.label.delete({ where: { id: labelId } });

  return { id: labelId, success: true };
}
