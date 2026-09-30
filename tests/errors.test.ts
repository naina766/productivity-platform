import { getErrorMessage } from '../lib/errors/normalize';
import { ApiError } from '../lib/api/client';
import { Errors } from '../lib/errors';

describe('Errors — getErrorMessage normalises unknown error values safely', () => {
  it('returns a plain string message unchanged', () => {
    expect(getErrorMessage('Project not found')).toBe('Project not found');
  });

  it('returns the fallback for a whitespace-only string', () => {
    expect(getErrorMessage('   ')).toBe('An unexpected error occurred.');
  });

  it('extracts the message from an Error instance', () => {
    expect(getErrorMessage(new Error('Network timeout'))).toBe('Network timeout');
  });

  it('extracts the message from an AppError', () => {
    const appErr = Errors.forbidden('Access denied to workspace');
    expect(getErrorMessage(appErr)).toBe('Access denied to workspace');
    expect(appErr.status).toBe(403);
  });

  it('extracts the message from an ApiError', () => {
    const apiErr = new ApiError(404, 'Task not found');
    expect(getErrorMessage(apiErr)).toBe('Task not found');
    expect(apiErr.status).toBe(404);
  });

  it('extracts message from a plain object with a "message" field', () => {
    expect(getErrorMessage({ message: 'Invalid credentials' })).toBe('Invalid credentials');
  });

  it('extracts message from a plain object with an "error" field', () => {
    expect(getErrorMessage({ error: 'Rate limit exceeded' })).toBe('Rate limit exceeded');
  });

  it('returns fallback for null and undefined', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred.');
  });

  it('never returns "[object Event]" or "[object Object]" for browser Events', () => {
    const fakeEvent = {
      type: 'error',
      toString() {
        return '[object Event]';
      },
    };
    const msg = getErrorMessage(fakeEvent);
    expect(msg).not.toBe('[object Event]');
    expect(msg).not.toBe('[object Object]');
    expect(msg).toBe('An unexpected error occurred.');
  });
});

describe('Errors — AppError factory methods generate correct status codes', () => {
  it('badRequest() → 400 BAD_REQUEST', () => {
    const err = Errors.badRequest('Invalid payload');
    expect(err.status).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
  });

  it('unauthorized() → 401 UNAUTHORIZED', () => {
    const err = Errors.unauthorized('Session expired');
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('forbidden() → 403 FORBIDDEN', () => {
    const err = Errors.forbidden('Action not allowed');
    expect(err.status).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('notFound() → 404 NOT_FOUND', () => {
    const err = Errors.notFound('Resource missing');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('validation() → 422 VALIDATION_ERROR', () => {
    const err = Errors.validation('Invalid input');
    expect(err.status).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
  });
});
