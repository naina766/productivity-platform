import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createTaskSchema } from '@/lib/validations/task';
import { getProjectTasks, createTask } from '@/lib/tasks/task.service';
import {
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  ALL_TASK_SORTS,
  type TaskFilters,
  type TaskSort,
  type TaskStatus,
  type TaskPriority,
} from '@/types/task';

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);

    // A filter that is not a recognised enum value is ignored rather than
    // rejected, so a stale bookmark returns the unfiltered board.
    const filters: TaskFilters = {};

    const status = searchParams.get('status');
    if (status && ALL_TASK_STATUSES.includes(status as TaskStatus)) {
      filters.status = status as TaskStatus;
    }

    const priority = searchParams.get('priority');
    if (priority && ALL_TASK_PRIORITIES.includes(priority as TaskPriority)) {
      filters.priority = priority as TaskPriority;
    }

    const assigneeId = searchParams.get('assigneeId');
    if (assigneeId) filters.assigneeId = assigneeId;

    const milestoneId = searchParams.get('milestoneId');
    if (milestoneId) filters.milestoneId = milestoneId;

    const isRecurringParam = searchParams.get('isRecurring');
    if (isRecurringParam === 'true') filters.isRecurring = true;
    else if (isRecurringParam === 'false') filters.isRecurring = false;

    const search = searchParams.get('search');
    if (search) filters.search = search;

    const sortParam = searchParams.get('sort');
    const sort = ALL_TASK_SORTS.includes(sortParam as TaskSort) ? (sortParam as TaskSort) : 'position';

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
