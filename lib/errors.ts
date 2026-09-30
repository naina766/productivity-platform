/** Operational error with HTTP status + machine-readable code. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const Errors = {
  badRequest: (msg = 'Invalid request') =>
    new AppError(400, 'BAD_REQUEST', msg),
  unauthorized: (msg = 'Authentication required') =>
    new AppError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'You do not have permission for this resource') =>
    new AppError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Resource not found') =>
    new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Resource already exists') =>
    new AppError(409, 'CONFLICT', msg),
  validation: (msg = 'Invalid request', details?: unknown) =>
    new AppError(422, 'VALIDATION_ERROR', msg, details),
} as const;

/** Build a JSON-serialisable error body (never leaks internals). */
export function buildErrorResponse(err: unknown): { success: false; message: string } {
  if (err instanceof AppError) {
    return { success: false, message: err.message };
  }
  return { success: false, message: 'Something went wrong. Please try again.' };
}

export { getErrorMessage } from './errors/normalize';

