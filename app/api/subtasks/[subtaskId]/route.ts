import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateSubtaskSchema } from '@/lib/validations/subtask';
import { updateSubtask, deleteSubtask } from '@/lib/tasks/subtask.service';

type RouteContext = { params: Promise<{ subtaskId: string }> };

/**
 * PATCH /api/subtasks/[subtaskId]
 * Update a subtask (title, isCompleted, position).
 */
export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { subtaskId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateSubtaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const subtask = await updateSubtask(subtaskId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: subtask });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/subtasks/[subtaskId]
 * Delete a subtask.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { subtaskId } = await params;
    await deleteSubtask(subtaskId, user.id);
    return NextResponse.json({ success: true, message: 'Subtask deleted.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
