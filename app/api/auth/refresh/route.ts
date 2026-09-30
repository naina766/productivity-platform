import { NextRequest, NextResponse } from 'next/server';
import { refreshSession } from '@/lib/auth/auth.service';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { makeRefreshCookie, clearRefreshCookies } from '@/lib/auth/cookies';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit: 30 refresh attempts per 15 min per IP
  const ip = getClientIp(req);
  if (!checkRateLimit(`refresh:${ip}`, 30, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  const rawToken = req.cookies.get('refresh_token')?.value;
  if (!rawToken) {
    return NextResponse.json({ success: false, message: 'No refresh token.' }, { status: 401 });
  }

  try {
    const tokens = await refreshSession(rawToken);

    const res = NextResponse.json({ success: true, accessToken: tokens.accessToken });
    res.headers.append('Set-Cookie', makeRefreshCookie(tokens.refreshToken));
    return res;
  } catch (err) {
    const res = NextResponse.json(buildErrorResponse(err), {
      status: err instanceof AppError ? err.status : 500,
    });
    for (const cookie of clearRefreshCookies()) {
      res.headers.append('Set-Cookie', cookie);
    }
    return res;
  }
}
