import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { getProjectActivity } from '@/lib/activity/activity.service';

type RouteContext = { params: Promise<{ projectId: string }> };

/**
 * GET /api/projects/[projectId]/activity?limit=50&taskId=...
 * Return the collaboration timeline for a project the user can access.
 * IDOR-safe: project access is verified server-side before returning data.
 */
export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);

    const limitParam = Number(searchParams.get('limit') ?? '50');
    const limit = Number.isFinite(limitParam) ? limitParam : 50;
    const taskId = searchParams.get('taskId') ?? undefined;
    const taskIdValid = taskId && /^[\w-]+$/.test(taskId) && taskId.length <= 64 ? taskId : undefined;

    const activities = await getProjectActivity(projectId, user.id, limit, taskIdValid);
    return NextResponse.json({ success: true, data: { activities } });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}