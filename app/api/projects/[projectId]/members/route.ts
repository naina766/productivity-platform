import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { addProjectMemberSchema } from '@/lib/validations/project';
import { getProjectMembers, addProjectMember } from '@/lib/projects/project.service';
import type { WorkspaceRole } from '@/types/project';

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const members = await getProjectMembers(projectId, user.id);
    return NextResponse.json({ success: true, data: members });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = addProjectMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const member = await addProjectMember(
      projectId,
      user.id,
      parsed.data.userId,
      parsed.data.role as WorkspaceRole,
    );
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
