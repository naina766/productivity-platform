import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createCommentSchema } from '@/lib/validations/comment';
import { getTaskComments, createComment } from '@/lib/comments/comment.service';

type RouteContext = { params: Promise<{ taskId: string }> };

/**
 * GET /api/tasks/[taskId]/comments
 * List comments for an authorized task (oldest first).
 */
export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { taskId } = await params;
    const limit = Number(new URL(req.url).searchParams.get('limit') ?? '100');
    const comments = await getTaskComments(taskId, user.id, Number.isFinite(limit) ? limit : 100);
    return NextResponse.json({ success: true, data: { comments } });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/tasks/[taskId]/comments
 * Create a comment. Verifies authentication, task access, and content.
 */
export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { taskId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const comment = await createComment(taskId, user.id, parsed.data.content);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}