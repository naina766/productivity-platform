import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { loginUser } from '@/lib/auth/auth.service';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { makeRefreshCookie } from '@/lib/auth/cookies';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit: 10 attempts per 15 min per IP
  const ip = getClientIp(req);
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      // Return a generic error — do not reveal whether email or password is wrong
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    const result = await loginUser(parsed.data);

    // The refresh token travels only in the HttpOnly cookie; the body carries
    // the short-lived access token that the in-memory client holds.
    const res = NextResponse.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      workspace: result.workspace,
    });
    res.headers.append('Set-Cookie', makeRefreshCookie(result.refreshToken));
    return res;
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
