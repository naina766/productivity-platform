import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { markAllNotificationsRead } from '@/lib/notifications/notification.service';

/**
 * POST /api/notifications/read-all
 * Mark every notification for the current authenticated user as read.
 * The user id is taken from the session — never from the request body.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    await markAllNotificationsRead(user.id);
    return NextResponse.json({ success: true, unreadCount: 0 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}