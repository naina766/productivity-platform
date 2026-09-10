import type { NextFunction, Request, Response } from 'express';
import { Errors } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(Errors.unauthorized());
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    if (payload.type !== 'access') {
      next(Errors.unauthorized('Invalid token type'));
      return;
    }
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(Errors.unauthorized('Invalid or expired token'));
  }
}

export function requireUser(req: Request): AuthUser {
  if (!req.user) throw Errors.unauthorized();
  return req.user;
}
