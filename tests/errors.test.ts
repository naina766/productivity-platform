import test from 'node:test';
import assert from 'node:assert/strict';
import { getErrorMessage } from '../lib/errors/normalize';
import { ApiError } from '../lib/api/client';
import { Errors, AppError } from '../lib/errors';

test('Errors — getErrorMessage normalizes unknown error values safely', () => {
  // String error
  assert.equal(getErrorMessage('Project not found'), 'Project not found');
  assert.equal(getErrorMessage('   '), 'An unexpected error occurred.');

  // Error instance
  assert.equal(getErrorMessage(new Error('Network timeout')), 'Network timeout');

  // AppError / ApiError
  const appErr = Errors.forbidden('Access denied to workspace');
  assert.equal(getErrorMessage(appErr), 'Access denied to workspace');
  assert.equal(appErr.status, 403);

  const apiErr = new ApiError(404, 'Task not found');
  assert.equal(getErrorMessage(apiErr), 'Task not found');
  assert.equal(apiErr.status, 404);

  // Object with message or error field
  assert.equal(getErrorMessage({ message: 'Invalid credentials' }), 'Invalid credentials');
  assert.equal(getErrorMessage({ error: 'Rate limit exceeded' }), 'Rate limit exceeded');

  // Null, undefined, empty
  assert.equal(getErrorMessage(null), 'An unexpected error occurred.');
  assert.equal(getErrorMessage(undefined), 'An unexpected error occurred.');

  // Browser Event simulation: must NEVER return "[object Event]" or "[object Object]"
  const fakeEvent = {
    type: 'error',
    toString() {
      return '[object Event]';
    },
  };
  const msg = getErrorMessage(fakeEvent);
  assert.notEqual(msg, '[object Event]');
  assert.notEqual(msg, '[object Object]');
  assert.equal(msg, 'An unexpected error occurred.');
});

test('Errors — AppError factory methods generate proper status codes', () => {
  const unauthorized = Errors.unauthorized('Session expired');
  assert.equal(unauthorized.status, 401);
  assert.equal(unauthorized.code, 'UNAUTHORIZED');

  const forbidden = Errors.forbidden('Action not allowed');
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.code, 'FORBIDDEN');

  const notFound = Errors.notFound('Resource missing');
  assert.equal(notFound.status, 404);
  assert.equal(notFound.code, 'NOT_FOUND');

  const validation = Errors.validation('Invalid input');
  assert.equal(validation.status, 422);
  assert.equal(validation.code, 'VALIDATION_ERROR');
});
