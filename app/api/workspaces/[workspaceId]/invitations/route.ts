import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createInvitationSchema } from '@/lib/validations/invitation';
import {
  listWorkspaceInvitations,
  createWorkspaceInvitation,
} from '@/lib/workspaces/invitation.service';

/**
 * GET /api/workspaces/[workspaceId]/invitations
 * List all invitations for a workspace.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const invitations = await listWorkspaceInvitations(workspaceId, user.id);
    return NextResponse.json({ success: true, data: invitations });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/workspaces/[workspaceId]/invitations
 * Create and send a new invitation to a user by email.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = createInvitationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 }
      );
    }

    const invitation = await createWorkspaceInvitation(workspaceId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: invitation }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
