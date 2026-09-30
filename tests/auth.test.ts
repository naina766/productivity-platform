import { hashPassword, verifyPassword } from '../lib/auth/password';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/auth/jwt';
import { hashToken } from '../lib/auth/refresh-token';
import { registerSchema, loginSchema } from '../lib/validations/auth';

// Set test environment secrets before any test runs
process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret-minimum-32-characters-long!';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-minimum-32-characters-long!';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '7d';

describe('Auth — Password Hashing & Verification', () => {
  it('hashes a password to a valid bcrypt string', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$2/);
    expect(hash).not.toBe(password);
  });

  it('verifies the correct password against its hash', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);
    expect(await verifyPassword('WrongPassword123!', hash)).toBe(false);
  });
});

describe('Auth — Access Token Signing & Verification', () => {
  const userId = '00000000-0000-4000-8000-000000000001';
  const email = 'user@nova.demo';

  it('signs a valid access token', () => {
    const token = signAccessToken(userId, email);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
  });

  it('verifies payload fields of a signed access token', () => {
    const token = signAccessToken(userId, email);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(userId);
    expect(payload.email).toBe(email);
    expect(payload.type).toBe('access');
  });
});

describe('Auth — Refresh Token Signing & Unique JTI per rotation', () => {
  const userId = '00000000-0000-4000-8000-000000000001';

  it('generates unique refresh tokens in quick succession (prevents hash collision)', () => {
    const token1 = signRefreshToken(userId);
    const token2 = signRefreshToken(userId);
    expect(token1).not.toBe(token2);
  });

  it('verifies payload fields of signed refresh tokens', () => {
    const token = signRefreshToken(userId);
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe(userId);
    expect(payload.type).toBe('refresh');
  });
});

describe('Auth — Refresh Token Hashing (SHA-256)', () => {
  it('produces a deterministic 64-char hex SHA-256 hash', () => {
    const rawToken = 'sample-raw-refresh-token-string';
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(rawToken);
  });
});

describe('Auth — Register Input Validation Schema', () => {
  it('accepts valid input and normalises name and email', () => {
    const result = registerSchema.safeParse({
      name: '  Jane Doe  ',
      email: 'Jane.Doe@Example.com ',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Jane Doe');
      expect(result.data.email).toBe('jane.doe@example.com');
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email address', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      email: 'not-an-email',
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
  });
});

describe('Auth — Login Input Validation Schema', () => {
  it('accepts valid input and normalises email', () => {
    const result = loginSchema.safeParse({
      email: ' User@Demo.com ',
      password: 'AnyPassword123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@demo.com');
    }
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@demo.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('Auth — Atomic Conditional Refresh Token Claim (CAS)', () => {
  it('allows first claim and blocks second concurrent claim', async () => {
    const { claimRefreshToken } = await import('../lib/auth/refresh-token');
    const rawToken = 'test-token-cas';
    let isRevoked = false;

    const mockTx = {
      refreshToken: {
        updateMany: async ({ where }: any) => {
          if (!isRevoked && where.revokedAt === null) {
            isRevoked = true;
            return { count: 1 };
          }
          return { count: 0 };
        },
        findUnique: async () => ({ userId: 'user-123' }),
      },
    } as any;

    const firstClaim = await claimRefreshToken(rawToken, mockTx);
    expect(firstClaim).toBe('user-123');

    const secondClaim = await claimRefreshToken(rawToken, mockTx);
    expect(secondClaim).toBeNull();
  });
});
