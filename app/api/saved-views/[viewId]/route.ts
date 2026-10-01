import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateSavedViewSchema } from '@/lib/validations/saved-view';
import {
  updateSavedView,
  deleteSavedView,
} from '@/lib/saved-views/saved-view.service';

/**
 * PATCH /api/saved-views/[viewId]
 * Update a saved view.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ viewId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { viewId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateSavedViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 }
      );
    }

    const updated = await updateSavedView(viewId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/saved-views/[viewId]
 * Delete a saved view.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ viewId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { viewId } = await params;
    await deleteSavedView(viewId, user.id);
    return NextResponse.json({ success: true, message: 'Saved view deleted.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
