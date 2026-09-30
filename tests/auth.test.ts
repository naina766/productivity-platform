import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/auth/jwt';
import { hashToken } from '../lib/auth/refresh-token';
import { registerSchema, loginSchema } from '../lib/validations/auth';

// Set test environment secrets
process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret-minimum-32-characters-long!';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-minimum-32-characters-long!';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '7d';

test('Auth — Password Hashing & Verification', async () => {
  const password = 'SuperSecretPassword123!';
  const hash = await hashPassword(password);

  assert.ok(hash.startsWith('$2'), 'Hash should be a valid bcrypt hash');
  assert.notEqual(hash, password, 'Hash should not be equal to plain text');

  const isValid = await verifyPassword(password, hash);
  assert.equal(isValid, true, 'Correct password should verify successfully');

  const isInvalid = await verifyPassword('WrongPassword123!', hash);
  assert.equal(isInvalid, false, 'Incorrect password should fail verification');
});

test('Auth — Access Token Signing & Verification', () => {
  const userId = '00000000-0000-4000-8000-000000000001';
  const email = 'user@nova.demo';

  const token = signAccessToken(userId, email);
  assert.ok(typeof token === 'string' && token.length > 20, 'Access token should be a signed JWT string');

  const payload = verifyAccessToken(token);
  assert.equal(payload.sub, userId, 'Payload sub should match userId');
  assert.equal(payload.email, email, 'Payload email should match');
  assert.equal(payload.type, 'access', 'Payload type should be access');
});

test('Auth — Refresh Token Signing & Unique JTI per rotation', () => {
  const userId = '00000000-0000-4000-8000-000000000001';

  const token1 = signRefreshToken(userId);
  const token2 = signRefreshToken(userId);

  assert.notEqual(token1, token2, 'Two refresh tokens signed in quick succession must have unique JTIs to prevent hash collisions');

  const payload1 = verifyRefreshToken(token1);
  assert.equal(payload1.sub, userId, 'Payload sub should match userId');
  assert.equal(payload1.type, 'refresh', 'Payload type should be refresh');

  const payload2 = verifyRefreshToken(token2);
  assert.equal(payload2.sub, userId);
});

test('Auth — Refresh Token Hashing (SHA-256)', () => {
  const rawToken = 'sample-raw-refresh-token-string';
  const hash1 = hashToken(rawToken);
  const hash2 = hashToken(rawToken);

  assert.equal(hash1, hash2, 'SHA-256 hash must be deterministic');
  assert.equal(hash1.length, 64, 'SHA-256 hex digest must be 64 characters long');
  assert.notEqual(hash1, rawToken, 'Hash must not equal raw token');
});

test('Auth — Register Input Validation Schema', () => {
  // Valid input
  const valid = registerSchema.safeParse({
    name: '  Jane Doe  ',
    email: 'Jane.Doe@Example.com ',
    password: 'Password123!',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.name, 'Jane Doe', 'Name must be trimmed');
    assert.equal(valid.data.email, 'jane.doe@example.com', 'Email must be trimmed and lowercased');
  }

  // Short password rejection
  const shortPass = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: '123',
  });
  assert.equal(shortPass.success, false, 'Password under 8 characters must be rejected');

  // Invalid email rejection
  const invalidEmail = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'not-an-email',
    password: 'Password123!',
  });
  assert.equal(invalidEmail.success, false, 'Malformed email must be rejected');
});

test('Auth — Login Input Validation Schema', () => {
  const valid = loginSchema.safeParse({
    email: ' User@Demo.com ',
    password: 'AnyPassword123',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.email, 'user@demo.com');
  }

  const emptyPass = loginSchema.safeParse({
    email: 'user@demo.com',
    password: '',
  });
  assert.equal(emptyPass.success, false, 'Empty password must be rejected');
});
