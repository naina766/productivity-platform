import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

/** 404 for unknown /api routes. Mount after all routes, before errorHandler. */
export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const isApp = err instanceof AppError;
  const status = isApp ? err.status : 500;
  const code = isApp ? err.code : 'INTERNAL_ERROR';

  // Never leak stack traces / driver errors to clients.
  if (!isApp) {
    // eslint-disable-next-line no-console
    console.error('[api] unhandled error', err instanceof Error ? err.message : err);
  }

  res.status(status).json({
    success: false as const,
    error: {
      code,
      message: isApp ? err.message : 'Something went wrong',
      ...(isApp && err.details !== undefined ? { details: err.details } : {}),
      ...(!env.isProd && err instanceof Error && !isApp ? { debug: err.message } : {}),
    },
  });
}
