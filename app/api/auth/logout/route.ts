import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth/auth.service';

function clearRefreshCookie(): string {
  return 'refresh_token=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawToken = req.cookies.get('refresh_token')?.value;

  // Always attempt to revoke — safe if token missing or already revoked.
  await logoutUser(rawToken);

  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', clearRefreshCookie());
  return res;
}
