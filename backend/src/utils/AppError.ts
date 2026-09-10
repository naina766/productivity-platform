/** Operational error with an HTTP status + stable machine-readable code. */
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
  unauthorized: (msg = 'Authentication required') => new AppError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'You do not have permission for this resource') =>
    new AppError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Resource not found') => new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Resource already exists') => new AppError(409, 'CONFLICT', msg),
  validation: (msg = 'Invalid request', details?: unknown) =>
    new AppError(422, 'VALIDATION_ERROR', msg, details),
} as const;
