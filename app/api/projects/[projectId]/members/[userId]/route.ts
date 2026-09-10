import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateProjectMemberSchema } from '@/lib/validations/project';
import { updateProjectMember, removeProjectMember } from '@/lib/projects/project.service';
import type { WorkspaceRole } from '@/types/project';

type RouteContext = { params: Promise<{ projectId: string; userId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId, userId: targetUserId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateProjectMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const member = await updateProjectMember(
      projectId,
      user.id,
      targetUserId,
      parsed.data.role as WorkspaceRole,
    );
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
    const { projectId, userId: targetUserId } = await params;
    await removeProjectMember(projectId, user.id, targetUserId);
    return NextResponse.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
