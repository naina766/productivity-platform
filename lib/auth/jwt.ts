import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export interface AccessTokenPayload {
  sub: string;   // user id
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

function requireSecret(name: string): string {
  const val = process.env[name] ?? (name === 'JWT_ACCESS_SECRET' ? process.env.JWT_SECRET : undefined);
  if (!val) throw new Error(`${name} is not configured. Set it in .env.`);
  return val;
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: 'access' } satisfies AccessTokenPayload,
    requireSecret('JWT_ACCESS_SECRET'),
    { expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as jwt.SignOptions['expiresIn'] },
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' } satisfies RefreshTokenPayload,
    requireSecret('JWT_REFRESH_SECRET'),
    {
      expiresIn: (process.env.JWT_REFRESH_TTL ?? '7d') as jwt.SignOptions['expiresIn'],
      // Guarantee a unique token hash per rotation even when two calls land in
      // the same `iat` second; otherwise refresh always fails after login in
      // burst scenarios (unique constraint on `RefreshToken.tokenHash`).
      jwtid: randomUUID(),
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, requireSecret('JWT_ACCESS_SECRET')) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, requireSecret('JWT_REFRESH_SECRET')) as RefreshTokenPayload;
}
