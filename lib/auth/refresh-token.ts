import { createHash } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

/**
 * Hash a raw refresh token value with SHA-256.
 * Only the hash is stored in the database; the raw token lives in the HttpOnly cookie.
 */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export async function storeRefreshToken(
  userId: string,
  rawToken: string,
  expiresIn = '7d',
  tx?: Omit<Prisma.TransactionClient, '$transaction'>,
): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const ms = parseDurationMs(expiresIn);
  const expiresAt = new Date(Date.now() + ms);

  const client = tx ?? prisma;
  await client.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
}

export async function findValidRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!token) return null;
  if (token.revokedAt !== null) return null;
  if (token.expiresAt < new Date()) return null;
  return token;
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Convert a JWT-style duration string (e.g. "7d", "15m") to milliseconds. */
function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const n = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'd': return n * 24 * 60 * 60 * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
}
