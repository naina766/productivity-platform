import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

/** Access and refresh tokens are signed with different secrets, so one can never be replayed as the other. */
function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured. Set it in your environment.`);
  return value;
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email, type: 'access' } satisfies AccessTokenPayload, requireSecret('JWT_ACCESS_SECRET'), {
    expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' } satisfies RefreshTokenPayload, requireSecret('JWT_REFRESH_SECRET'), {
    expiresIn: (process.env.JWT_REFRESH_TTL ?? '7d') as jwt.SignOptions['expiresIn'],
    // A unique jti per token guarantees a unique SHA-256 hash on every rotation.
    // Without it, two tokens minted in the same `iat` second would collide on the
    // RefreshToken.tokenHash unique constraint and the second rotation would fail.
    jwtid: randomUUID(),
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, requireSecret('JWT_ACCESS_SECRET')) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, requireSecret('JWT_REFRESH_SECRET')) as RefreshTokenPayload;
}
