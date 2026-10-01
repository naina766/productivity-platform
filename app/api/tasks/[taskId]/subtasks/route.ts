import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createSubtaskSchema } from '@/lib/validations/subtask';
import { getSubtasks, createSubtask } from '@/lib/tasks/subtask.service';

type RouteContext = { params: Promise<{ taskId: string }> };

/**
 * GET /api/tasks/[taskId]/subtasks
 * List subtasks for an authorized task.
 */
export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { taskId } = await params;
    const subtasks = await getSubtasks(taskId, user.id);
    return NextResponse.json({ success: true, data: { subtasks } });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/tasks/[taskId]/subtasks
 * Create a subtask for an authorized task.
 */
export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { taskId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = createSubtaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const subtask = await createSubtask(taskId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: subtask }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
