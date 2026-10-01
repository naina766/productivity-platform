import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { revokeWorkspaceInvitation } from '@/lib/workspaces/invitation.service';

/**
 * DELETE /api/workspaces/[workspaceId]/invitations/[invitationId]
 * Revoke an invitation.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; invitationId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId, invitationId } = await params;
    await revokeWorkspaceInvitation(workspaceId, invitationId, user.id);
    return NextResponse.json({ success: true, message: 'Invitation revoked successfully.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
