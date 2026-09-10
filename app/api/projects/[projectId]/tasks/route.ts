import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createTaskSchema } from '@/lib/validations/task';
import { getProjectTasks, createTask } from '@/lib/tasks/task.service';
import type { TaskStatus, TaskPriority, TaskSort } from '@/types/task';

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);

    const filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      search?: string;
    } = {};

    const status = searchParams.get('status');
    if (status && ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(status)) {
      filters.status = status as TaskStatus;
    }

    const priority = searchParams.get('priority');
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      filters.priority = priority as TaskPriority;
    }

    const assigneeId = searchParams.get('assigneeId');
    if (assigneeId) {
      filters.assigneeId = assigneeId;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const sortParam = searchParams.get('sort') as TaskSort | null;
    const sort: TaskSort = sortParam && ['createdAt', 'updatedAt', 'dueDate', 'priority', 'position'].includes(sortParam)
      ? sortParam
      : 'position';

    const tasks = await getProjectTasks(projectId, user.id, filters, sort);
    return NextResponse.json({ success: true, data: tasks });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const task = await createTask(projectId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
