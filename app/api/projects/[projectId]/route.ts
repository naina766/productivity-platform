import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateProjectSchema } from '@/lib/validations/project';
import {
  getProjectById,
  updateProject,
  archiveProject,
} from '@/lib/projects/project.service';

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const project = await getProjectById(projectId, user.id);
    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const project = await updateProject(projectId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/** Soft-delete: sets status = ARCHIVED. */
export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const result = await archiveProject(projectId, user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
