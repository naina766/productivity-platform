import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { addWorkspaceMemberSchema } from '@/lib/validations/workspace';
import {
  getWorkspaceMembers,
  addWorkspaceMember,
} from '@/lib/workspaces/workspace-member.service';

/**
 * GET /api/workspaces/[workspaceId]/members
 * List workspace members. Requires workspace membership.
 *
 * POST /api/workspaces/[workspaceId]/members
 * Add an existing NOVA user to the workspace by email. Requires OWNER/ADMIN.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const members = await getWorkspaceMembers(workspaceId, user.id);
    return NextResponse.json({ success: true, data: members });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = addWorkspaceMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const member = await addWorkspaceMember(workspaceId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}