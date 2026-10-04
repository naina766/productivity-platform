import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, getUserWorkspace } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { serializeTask } from '@/lib/tasks/task.service';
import { Prisma } from '@prisma/client';
import {
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
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

  // Get all projects in current workspace
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true },
  });

  const projectMap = new Map<string, string>();
  projects.forEach((p) => projectMap.set(p.id, p.name));
  const projectIds = projects.map((p) => p.id);

  if (projectIds.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }

  const { searchParams } = new URL(req.url);

  const where: Prisma.TaskWhereInput = {
    projectId: { in: projectIds },
    dueDate: { not: null },
  };

  // Optional date range
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  if (start && end) {
    where.dueDate = {
      gte: new Date(start),
      lte: new Date(end),
    };
  } else if (start) {
    where.dueDate = { gte: new Date(start) };
  } else if (end) {
    where.dueDate = { lte: new Date(end) };
  }

  // Optional project filter
  const filterProjectId = searchParams.get('projectId');
  if (filterProjectId && projectIds.includes(filterProjectId)) {
    where.projectId = filterProjectId;
  }

  // Optional assignee filter
  const filterAssignee = searchParams.get('assigneeId');
  if (filterAssignee === 'me') {
    where.assigneeId = user.id;
  } else if (filterAssignee === 'unassigned') {
    where.assigneeId = null;
  } else if (filterAssignee) {
    where.assigneeId = filterAssignee;
  }

  // Optional status filter
  const status = searchParams.get('status');
  if (status && ALL_TASK_STATUSES.includes(status as TaskStatus)) {
    where.status = status as TaskStatus;
  }

  // Optional priority filter
  const priority = searchParams.get('priority');
  if (priority && ALL_TASK_PRIORITIES.includes(priority as TaskPriority)) {
    where.priority = priority as TaskPriority;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { dueDate: 'asc' },
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

  return NextResponse.json({ success: true, data });
}
