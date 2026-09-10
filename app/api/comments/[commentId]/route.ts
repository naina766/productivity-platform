import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateCommentSchema } from '@/lib/validations/comment';
import { updateComment, deleteComment } from '@/lib/comments/comment.service';

type RouteContext = { params: Promise<{ commentId: string }> };

/**
 * PATCH /api/comments/[commentId]
 * Edit a comment. Only the author may edit their own comment.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { commentId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const comment = await updateComment(commentId, user.id, parsed.data.content);
    return NextResponse.json({ success: true, data: comment });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/comments/[commentId]
 * Delete a comment. Author-only (workspace ADMIN+ may moderate).
 */
export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { commentId } = await params;
    await deleteComment(commentId, user.id);
    return NextResponse.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}