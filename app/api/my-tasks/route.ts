import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, getUserWorkspace } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { serializeTask } from '@/lib/tasks/task.service';
import { getDateBoundaries, buildDateViewFilter } from '@/lib/tasks/date-utils';
import type { Prisma } from '@prisma/client';
import {
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
  type TaskDateView,
} from '@/types/task';

export async function GET(req: NextRequest): Promise<NextResponse<any>> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  const workspace = await getUserWorkspace(user.id);
  if (!workspace) {
    return NextResponse.json({ success: false, message: 'Workspace not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const viewParam = searchParams.get('view') as TaskDateView | null;
  const view: TaskDateView = viewParam && ['all', 'today', 'upcoming', 'overdue'].includes(viewParam)
    ? viewParam
    : 'all';

  const tzParam = searchParams.get('timezoneOffset');
  const timezoneOffset = tzParam !== null ? parseInt(tzParam, 10) : undefined;
  const boundaries = getDateBoundaries(new Date(), isNaN(timezoneOffset ?? NaN) ? undefined : timezoneOffset);

  // Map project IDs in current workspace
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true },
  });

  const projectMap = new Map<string, string>();
  projects.forEach((p) => projectMap.set(p.id, p.name));
  const projectIds = projects.map((p) => p.id);

  if (projectIds.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      counts: { all: 0, today: 0, upcoming: 0, overdue: 0 },
    });
  }

  // Base scope: assigned to current user, within active workspace projects
  const baseScope: Prisma.TaskWhereInput = {
    assigneeId: user.id,
    projectId: { in: projectIds },
  };

  // Optional project filter
  const filterProjectId = searchParams.get('projectId');
  if (filterProjectId && projectIds.includes(filterProjectId)) {
    baseScope.projectId = filterProjectId;
  }

  // Query counts in parallel across all date buckets
  const [allCount, todayCount, upcomingCount, overdueCount] = await Promise.all([
    prisma.task.count({
      where: {
        ...baseScope,
      },
    }),
    prisma.task.count({
      where: {
        ...baseScope,
        ...buildDateViewFilter('today', boundaries),
      },
    }),
    prisma.task.count({
      where: {
        ...baseScope,
        ...buildDateViewFilter('upcoming', boundaries),
      },
    }),
    prisma.task.count({
      where: {
        ...baseScope,
        ...buildDateViewFilter('overdue', boundaries),
      },
    }),
  ]);

  // Build where input for the requested view
  const where: Prisma.TaskWhereInput = {
    ...baseScope,
    ...buildDateViewFilter(view, boundaries),
  };

  // Optional status filter
  const statusParam = searchParams.get('status');
  if (statusParam && ALL_TASK_STATUSES.includes(statusParam as TaskStatus)) {
    where.status = statusParam as TaskStatus;
  }

  // Optional priority filter
  const priorityParam = searchParams.get('priority');
  if (priorityParam && ALL_TASK_PRIORITIES.includes(priorityParam as TaskPriority)) {
    where.priority = priorityParam as TaskPriority;
  }

  // Optional search query
  const search = searchParams.get('search')?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Determine sorting based on view
  let orderBy: Prisma.TaskOrderByWithRelationInput[] = [{ updatedAt: 'desc' }];
  if (view === 'overdue') {
    orderBy = [{ dueDate: 'asc' }, { priority: 'desc' }];
  } else if (view === 'today') {
    orderBy = [{ priority: 'desc' }, { dueDate: 'asc' }];
  } else if (view === 'upcoming') {
    orderBy = [{ dueDate: 'asc' }, { priority: 'desc' }];
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: { select: { label: { select: { id: true, name: true, color: true } } } },
    },
  });

  const data = tasks.map((task) => {
    const base = serializeTask(task as any);
    const projectName = projectMap.get(task.projectId) ?? '';
    return { ...base, projectName };
  });

  return NextResponse.json({
    success: true,
    data,
    counts: {
      all: allCount,
      today: todayCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    },
  });
}
