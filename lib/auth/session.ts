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
 * Resolve the caller from the Authorization header.
 *
 * The user id always comes from the verified token payload — never from a
 * request body, query parameter, or path segment — so a client cannot act as
 * another user. Returns null for a missing, malformed, expired, or wrongly
 * typed token.
 */
export async function getCurrentUser(req: NextRequest): Promise<SafeUser | null> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    if (payload.type !== 'access') return null;

    return await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  } catch {
    return null;
  }
}

/** The caller's primary workspace, which scopes the app after sign-in. */
export interface SessionWorkspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

/**
 * The user's earliest workspace membership, used to scope the app on load.
 * Returns null when the user belongs to no workspace.
 */
export async function getUserWorkspace(userId: string): Promise<SessionWorkspace | null> {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) return null;

  return { ...membership.workspace, role: membership.role };
}
