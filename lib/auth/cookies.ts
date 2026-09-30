/**
 * Centralized cookie helpers for NOVA authentication.
 * Scopes refresh token to Path=/ so Edge middleware can detect active sessions
 * on protected routes (/dashboard, /projects) without revealing tokens to JavaScript.
 */

const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';

export function parseTtlToSeconds(ttl: string): number {
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

export function makeRefreshCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = parseTtlToSeconds(REFRESH_TTL);
  const parts = [
    `refresh_token=${token}`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${maxAge}`,
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

export function clearRefreshCookies(): string[] {
  return [
    'refresh_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0',
    'refresh_token=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0',
  ];
}
