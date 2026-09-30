import { durationToSeconds } from '@/lib/auth/duration';

/**
 * The refresh cookie is scoped to Path=/ so Edge middleware can detect an active
 * session on protected pages without ever reading the token in JavaScript.
 */
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';
const DEFAULT_REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export function makeRefreshCookie(token: string): string {
  const maxAge = durationToSeconds(REFRESH_TTL, DEFAULT_REFRESH_TTL_SECONDS);
  const parts = [
    `refresh_token=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function clearRefreshCookie(): string {
  return 'refresh_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
}
