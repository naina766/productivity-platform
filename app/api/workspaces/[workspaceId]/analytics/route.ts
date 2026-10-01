import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { getWorkspaceAnalytics } from '@/lib/workspaces/analytics.service';

type RouteContext = { params: Promise<{ workspaceId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const { searchParams } = new URL(req.url);
    const tzParam = searchParams.get('timezoneOffset');
    const timezoneOffset = tzParam !== null ? parseInt(tzParam, 10) : undefined;

    const analytics = await getWorkspaceAnalytics(
      workspaceId,
      user.id,
      isNaN(timezoneOffset ?? NaN) ? undefined : timezoneOffset
    );

    return NextResponse.json({ success: true, data: analytics });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
