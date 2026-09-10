import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { loginUser } from '@/lib/auth/auth.service';
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

    const res = NextResponse.json({
      success: true,
      user: result.user,
      accessToken: result.tokens.accessToken,
      workspace: result.workspace,
    });
    res.headers.append('Set-Cookie', makeRefreshCookie(result.tokens.refreshToken));
    return res;
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
