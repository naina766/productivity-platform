import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateLabelSchema } from '@/lib/validations/label';
import {
  updateWorkspaceLabel,
  deleteWorkspaceLabel,
} from '@/lib/labels/label.service';

/**
 * PATCH /api/workspaces/[workspaceId]/labels/[labelId]
 * Update label name or color. Requires OWNER or ADMIN.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; labelId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId, labelId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateLabelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const updated = await updateWorkspaceLabel(workspaceId, labelId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/labels/[labelId]
 * Delete a label from the workspace. Requires OWNER or ADMIN.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; labelId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId, labelId } = await params;
    const result = await deleteWorkspaceLabel(workspaceId, labelId, user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
