import { prisma } from '@/lib/db/prisma';
import { Errors } from '@/lib/errors';
import type {
  SavedView,
  CreateSavedViewInput,
  UpdateSavedViewInput,
  SavedViewFilters,
} from '@/types/saved-view';

interface DbSavedView {
  id: string;
  workspaceId: string;
  projectId: string | null;
  userId: string;
  name: string;
  filters: unknown;
  sortBy: string | null;
  sortOrder: string | null;
  viewType: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
  };
}

export function serializeSavedView(view: DbSavedView): SavedView {
  return {
    id: view.id,
    workspaceId: view.workspaceId,
    projectId: view.projectId,
    userId: view.userId,
    name: view.name,
    filters: (view.filters as SavedViewFilters) ?? {},
    sortBy: view.sortBy,
    sortOrder: (view.sortOrder as 'asc' | 'desc') ?? null,
    viewType: (view.viewType as 'list' | 'board' | 'calendar') ?? 'list',
    isShared: view.isShared,
    createdAt: view.createdAt.toISOString(),
    updatedAt: view.updatedAt.toISOString(),
    userName: view.user?.name,
  };
}

export async function listSavedViews(
  workspaceId: string,
  userId: string,
  projectId?: string
): Promise<SavedView[]> {
  // Validate workspace membership
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  });
  if (!member) {
    throw Errors.forbidden('You do not have access to this workspace');
  }

  // Where condition: workspaceId, optional projectId filter, visible to user (own or shared)
  const where: {
    workspaceId: string;
    projectId?: string | null;
    OR: Array<{ userId: string } | { isShared: boolean }>;
  } = {
    workspaceId,
    OR: [{ userId }, { isShared: true }],
  };

  if (projectId !== undefined) {
    where.projectId = projectId;
  }

  const views = await prisma.savedView.findMany({
    where,
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return views.map(serializeSavedView);
}

export async function createSavedView(
  workspaceId: string,
  userId: string,
  input: CreateSavedViewInput
): Promise<SavedView> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  });
  if (!member) {
    throw Errors.forbidden('You do not have access to this workspace');
  }

  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, workspaceId },
    });
    if (!project) {
      throw Errors.notFound('Project not found in this workspace');
    }
  }

  const created = await prisma.savedView.create({
    data: {
      workspaceId,
      projectId: input.projectId ?? null,
      userId,
      name: input.name,
      filters: input.filters as object,
      sortBy: input.sortBy ?? null,
      sortOrder: input.sortOrder ?? null,
      viewType: input.viewType ?? 'list',
      isShared: input.isShared ?? false,
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  return serializeSavedView(created);
}

export async function updateSavedView(
  viewId: string,
  userId: string,
  input: UpdateSavedViewInput
): Promise<SavedView> {
  const existing = await prisma.savedView.findUnique({
    where: { id: viewId },
  });
  if (!existing) {
    throw Errors.notFound('Saved view not found');
  }

  // Check if owner or workspace admin
  if (existing.userId !== userId) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existing.workspaceId,
          userId,
        },
      },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw Errors.forbidden('You can only edit your own saved views');
    }
  }

  const updated = await prisma.savedView.update({
    where: { id: viewId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.filters !== undefined ? { filters: input.filters as object } : {}),
      ...(input.sortBy !== undefined ? { sortBy: input.sortBy } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.viewType !== undefined ? { viewType: input.viewType } : {}),
      ...(input.isShared !== undefined ? { isShared: input.isShared } : {}),
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  return serializeSavedView(updated);
}

export async function deleteSavedView(viewId: string, userId: string): Promise<void> {
  const existing = await prisma.savedView.findUnique({
    where: { id: viewId },
  });
  if (!existing) {
    throw Errors.notFound('Saved view not found');
  }

  // Check if owner or workspace admin
  if (existing.userId !== userId) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existing.workspaceId,
          userId,
        },
      },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw Errors.forbidden('You can only delete your own saved views');
    }
  }

  await prisma.savedView.delete({
    where: { id: viewId },
  });
}
