import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import {
  getInvitationByToken,
  acceptWorkspaceInvitation,
} from '@/lib/workspaces/invitation.service';

/**
 * GET /api/invitations/[token]
 * Public inspection of an invitation's metadata.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await params;
    const details = await getInvitationByToken(token);
    return NextResponse.json({ success: true, data: details });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/invitations/[token]
 * Accept the invitation as the currently logged-in user.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Please log in or create an account to accept this invitation.' },
      { status: 401 }
    );
  }

  try {
    const { token } = await params;
    const result = await acceptWorkspaceInvitation(token, user.id);
    return NextResponse.json({
      success: true,
      message: `Successfully joined ${result.workspaceName}!`,
      data: result,
    });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
