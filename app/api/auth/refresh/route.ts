import { NextRequest, NextResponse } from 'next/server';
import { refreshSession } from '@/lib/auth/auth.service';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';

function makeRefreshCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = parseTtlToSeconds(REFRESH_TTL);
  const parts = [
    `refresh_token=${token}`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/api/auth`,
    `Max-Age=${maxAge}`,
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

function clearRefreshCookie(): string {
  return 'refresh_token=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0';
}

function parseTtlToSeconds(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60;
  const n = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return n;
    case 'm': return n * 60;
    case 'h': return n * 3600;
    case 'd': return n * 86400;
    default:  return 7 * 24 * 3600;
  }
}

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
    res.headers.append('Set-Cookie', clearRefreshCookie());
    return res;
  }
}
