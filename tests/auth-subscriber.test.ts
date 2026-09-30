import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setAccessToken,
  getAccessToken,
  onAuthFailure,
  notifyAuthFailure,
} from '../lib/api/client';

test('API Client — In-memory Access Token & Auth Failure Listener', () => {
  // Test memory token setter/getter
  setAccessToken(null);
  assert.equal(getAccessToken(), null);

  const mockToken = 'mock-jwt-token-12345';
  setAccessToken(mockToken);
  assert.equal(getAccessToken(), mockToken);

  // Test onAuthFailure subscription
  let calls = 0;
  const unsubscribe = onAuthFailure(() => {
    calls++;
  });

  notifyAuthFailure();
  assert.equal(calls, 1, 'Callback should be called once on notification');

  notifyAuthFailure();
  assert.equal(calls, 2, 'Callback should be called twice');

  // Test unsubscribe
  unsubscribe();
  notifyAuthFailure();
  assert.equal(calls, 2, 'Unsubscribed callback should not receive subsequent notifications');

  // Clean up
  setAccessToken(null);
});
