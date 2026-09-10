import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { getUserNotifications } from '@/lib/notifications/notification.service';
import type { NotificationListResponse } from '@/types/notification';

/**
 * GET /api/notifications?unread=true&limit=50
 * Return the authenticated user's own notifications + unread count.
 * Never returns another user's notifications (user id comes from the session).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const unread = searchParams.get('unread') === 'true';
    const limitParam = Number(searchParams.get('limit') ?? '50');

    const data: NotificationListResponse = await getUserNotifications(user.id, {
      unread: unread || undefined,
      limit: Number.isFinite(limitParam) ? limitParam : 50,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}