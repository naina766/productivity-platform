import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export function signAccessToken(userId: string, email: string): string {
  if (!env.jwtAccessSecret) throw new Error('JWT_ACCESS_SECRET is not configured');
  return jwt.sign({ sub: userId, email, type: 'access' } satisfies AccessTokenPayload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl as unknown as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string): string {
  if (!env.jwtRefreshSecret) throw new Error('JWT_REFRESH_SECRET is not configured');
  return jwt.sign({ sub: userId, type: 'refresh' } satisfies RefreshTokenPayload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as unknown as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}
