import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateWorkspaceMemberRoleSchema } from '@/lib/validations/workspace';
import {
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from '@/lib/workspaces/workspace-member.service';

type RouteContext = { params: Promise<{ workspaceId: string; userId: string }> };

/**
 * PATCH /api/workspaces/[workspaceId]/members/[userId]
 * Change a member's role. Requires OWNER/ADMIN.
 *
 * DELETE /api/workspaces/[workspaceId]/members/[userId]
 * Remove a member. Requires OWNER/ADMIN. The owner cannot be removed.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId, userId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateWorkspaceMemberRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const member = await updateWorkspaceMemberRole(workspaceId, user.id, userId, parsed.data);
    return NextResponse.json({ success: true, data: member });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId, userId } = await params;
    await removeWorkspaceMember(workspaceId, user.id, userId);
    return NextResponse.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}