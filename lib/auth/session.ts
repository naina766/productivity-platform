import { type NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Server-side session helper.
 * Reads the Authorization header from a Route Handler request,
 * verifies the access JWT, and returns the authenticated user.
 * Returns null if the token is missing, malformed, or expired.
 * Never trusts a user ID provided by the browser directly.
 */
export async function getCurrentUser(req: NextRequest): Promise<SafeUser | null> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return user;
  } catch {
    return null;
  }
}
