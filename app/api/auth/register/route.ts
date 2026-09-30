import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { registerUser } from '@/lib/auth/auth.service';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { makeRefreshCookie } from '@/lib/auth/cookies';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit: 5 registrations per 15 min per IP
  const ip = getClientIp(req);
  if (!checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid request.';
      return NextResponse.json({ success: false, message }, { status: 422 });
    }

    const result = await registerUser(parsed.data);

    const res = NextResponse.json(
      {
        success: true,
        user: result.user,
        accessToken: result.tokens.accessToken,
        workspace: result.workspace,
      },
      { status: 201 },
    );
    res.headers.append('Set-Cookie', makeRefreshCookie(result.tokens.refreshToken));
    return res;
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
