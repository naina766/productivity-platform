import {
  setAccessToken,
  getAccessToken,
  onAuthFailure,
  notifyAuthFailure,
} from '../lib/api/client';

describe('API Client — In-memory Access Token Management', () => {
  afterEach(() => {
    // Reset token state after each test
    setAccessToken(null);
  });

  it('stores null initially and after being reset', () => {
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('stores and retrieves a mock JWT token', () => {
    const mockToken = 'mock-jwt-token-12345';
    setAccessToken(mockToken);
    expect(getAccessToken()).toBe(mockToken);
  });
});

describe('API Client — Auth Failure Listener (pub/sub)', () => {
  it('calls subscriber once when notifyAuthFailure is triggered', () => {
    let calls = 0;
    const unsubscribe = onAuthFailure(() => { calls++; });
    notifyAuthFailure();
    expect(calls).toBe(1);
    unsubscribe();
  });

  it('calls subscriber multiple times for multiple notifications', () => {
    let calls = 0;
    const unsubscribe = onAuthFailure(() => { calls++; });
    notifyAuthFailure();
    notifyAuthFailure();
    expect(calls).toBe(2);
    unsubscribe();
  });

  it('stops calling subscriber after unsubscribe()', () => {
    let calls = 0;
    const unsubscribe = onAuthFailure(() => { calls++; });
    notifyAuthFailure();
    unsubscribe();
    notifyAuthFailure();
    expect(calls).toBe(1);
  });
});
