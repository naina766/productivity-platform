import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth/auth.service';
import { clearRefreshCookie } from '@/lib/auth/cookies';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Always attempt to revoke — safe if token missing or already revoked.
  await logoutUser(req.cookies.get('refresh_token')?.value);

  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', clearRefreshCookie());
  return res;
}
