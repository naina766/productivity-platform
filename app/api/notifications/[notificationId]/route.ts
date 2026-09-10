import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { markNotificationRead } from '@/lib/notifications/notification.service';

type RouteContext = { params: Promise<{ notificationId: string }> };

/**
 * PATCH /api/notifications/[notificationId]
 * Mark one notification as read. Ownership is enforced server-side; a
 * notification that is not the caller's resolves to 404 (IDOR-safe).
 */
export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { notificationId } = await params;
    await markNotificationRead(notificationId, user.id);
    return NextResponse.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}