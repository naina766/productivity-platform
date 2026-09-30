import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth/auth.service';
import { clearRefreshCookies } from '@/lib/auth/cookies';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawToken = req.cookies.get('refresh_token')?.value;

  // Always attempt to revoke — safe if token missing or already revoked.
  await logoutUser(rawToken);

  const res = NextResponse.json({ success: true });
  for (const cookie of clearRefreshCookies()) {
    res.headers.append('Set-Cookie', cookie);
  }
  return res;
}
