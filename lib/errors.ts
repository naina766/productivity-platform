/** An expected failure with an HTTP status and a machine-readable code. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export const Errors = {
  badRequest: (message = 'Invalid request') => new AppError(400, 'BAD_REQUEST', message),
  unauthorized: (message = 'Authentication required') => new AppError(401, 'UNAUTHORIZED', message),
  forbidden: (message = 'You do not have permission for this resource') =>
    new AppError(403, 'FORBIDDEN', message),
  notFound: (message = 'Resource not found') => new AppError(404, 'NOT_FOUND', message),
  conflict: (message = 'Resource already exists') => new AppError(409, 'CONFLICT', message),
  validation: (message = 'Invalid request') => new AppError(422, 'VALIDATION_ERROR', message),
} as const;

/**
 * Build a client-safe error body. Only AppError messages are surfaced; anything
 * unexpected becomes a generic message so stack traces and driver internals
 * never reach the browser.
 */
export function buildErrorResponse(err: unknown): { success: false; message: string } {
  if (err instanceof AppError) {
    return { success: false, message: err.message };
  }
  return { success: false, message: 'Something went wrong. Please try again.' };
}

export { getErrorMessage } from './errors/normalize';
