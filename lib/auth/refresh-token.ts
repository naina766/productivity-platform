import { createHash } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { durationToSeconds } from '@/lib/auth/duration';

const DEFAULT_REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Only the SHA-256 hash of a refresh token is persisted; the raw value lives in
 * an HttpOnly cookie and is never readable from JavaScript.
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
  const client = tx ?? prisma;
  await client.refreshToken.create({
    data: {
      tokenHash: hashToken(rawToken),
      userId,
      expiresAt: new Date(Date.now() + durationToSeconds(expiresIn, DEFAULT_REFRESH_TTL_SECONDS) * 1000),
    },
  });
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Atomically claim a refresh token by revoking it with a conditional update.
 *
 * Rotation is single-use: the WHERE clause only matches rows that are not yet
 * revoked and not expired, so two concurrent requests carrying the same token
 * cannot both succeed — the loser sees count === 0. Returns the owning userId
 * on success, or null when the token is unknown, expired, or already used.
 */
export async function claimRefreshToken(
  rawToken: string,
  tx: Omit<Prisma.TransactionClient, '$transaction'>,
): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const { count } = await tx.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: now } },
    data: { revokedAt: now },
  });

  if (count === 0) return null;

  const claimed = await tx.refreshToken.findUnique({
    where: { tokenHash },
    select: { userId: true },
  });

  return claimed?.userId ?? null;
}
