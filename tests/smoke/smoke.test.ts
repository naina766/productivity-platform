/**
 * NOVA — Critical Application Logic Smoke Tests
 *
 * These tests verify the core application logic without a browser or database.
 * They cover authentication flows, authorization rules, validation, and error
 * handling that are critical for the application to function correctly.
 *
 * Not browser E2E tests — these are unit/integration-level tests covering
 * the most important code paths in the NOVA platform.
 */

// ─── Environment setup ────────────────────────────────────────────────────────
process.env.JWT_ACCESS_SECRET = 'smoke-test-jwt-access-secret-min-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'smoke-test-jwt-refresh-secret-min-32-chars!';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '7d';

import { hashPassword, verifyPassword } from '../../lib/auth/password';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../lib/auth/jwt';
import { hashToken } from '../../lib/auth/refresh-token';
import {
  canCreateProject,
  canManageProject,
  canOwnerAction,
} from '../../lib/projects/permissions';
import { registerSchema, loginSchema } from '../../lib/validations/auth';
import { createProjectSchema, updateProjectSchema } from '../../lib/validations/project';
import { createTaskSchema, updateTaskSchema } from '../../lib/validations/task';
import { getErrorMessage } from '../../lib/errors/normalize';
import { ApiError } from '../../lib/api/client';
import { Errors } from '../../lib/errors';

// ─── Authentication: Password security ───────────────────────────────────────

describe('SMOKE: Authentication — Password Security', () => {
  it('bcrypt hash is not equal to the plain-text password', async () => {
    const pwd = 'SmokeTest123!';
    const hash = await hashPassword(pwd);
    expect(hash).not.toBe(pwd);
    expect(hash).toMatch(/^\$2[aby]/); // valid bcrypt prefix
  });

  it('correct password passes verification', async () => {
    const pwd = 'SmokeTest123!';
    const hash = await hashPassword(pwd);
    expect(await verifyPassword(pwd, hash)).toBe(true);
  });

  it('wrong password fails verification', async () => {
    const pwd = 'SmokeTest123!';
    const hash = await hashPassword(pwd);
    expect(await verifyPassword('WrongPassword!', hash)).toBe(false);
  });
});

// ─── Authentication: JWT access tokens ───────────────────────────────────────

describe('SMOKE: Authentication — JWT Access Tokens', () => {
  const userId = 'aaaaaaaa-0000-4000-8000-000000000001';
  const email = 'smoke@nova.demo';

  it('signed access token verifies to correct payload', () => {
    const token = signAccessToken(userId, email);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(userId);
    expect(payload.email).toBe(email);
    expect(payload.type).toBe('access');
  });

  it('tampered access token is rejected', () => {
    const token = signAccessToken(userId, email);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('access token cannot be used as refresh token', () => {
    const token = signAccessToken(userId, email);
    expect(() => verifyRefreshToken(token)).toThrow(); // signed with different secret
  });
});

// ─── Authentication: JWT refresh tokens ──────────────────────────────────────

describe('SMOKE: Authentication — JWT Refresh Tokens', () => {
  const userId = 'aaaaaaaa-0000-4000-8000-000000000002';

  it('each refresh token has a unique JTI (prevents hash collision on rotation)', () => {
    const t1 = signRefreshToken(userId);
    const t2 = signRefreshToken(userId);
    expect(t1).not.toBe(t2); // different JTI → different signature
  });

  it('refresh token hash is deterministic (SHA-256)', () => {
    const raw = 'some-raw-refresh-token-value';
    expect(hashToken(raw)).toBe(hashToken(raw)); // same input → same hash
    expect(hashToken(raw)).toHaveLength(64); // SHA-256 hex = 64 chars
    expect(hashToken(raw)).not.toBe(raw);
  });

  it('refresh token cannot be used as an access token', () => {
    const token = signRefreshToken(userId);
    expect(() => verifyAccessToken(token)).toThrow(); // different secret
  });
});

// ─── Authentication: CAS (Compare-and-Swap) refresh claim ────────────────────

describe('SMOKE: Authentication — Atomic Refresh Token CAS', () => {
  it('first claim returns userId; second concurrent claim returns null', async () => {
    const { claimRefreshToken } = await import('../../lib/auth/refresh-token');
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
        findUnique: async () => ({ userId: 'smoke-user-id' }),
      },
    } as any;

    expect(await claimRefreshToken('smoke-token', mockTx)).toBe('smoke-user-id');
    expect(await claimRefreshToken('smoke-token', mockTx)).toBeNull(); // token already revoked
  });
});

// ─── Authentication: Input validation ────────────────────────────────────────

describe('SMOKE: Authentication — Input Validation (Register)', () => {
  it('accepts valid registration data and normalises name/email', () => {
    const result = registerSchema.safeParse({
      name: '  Smoke User  ',
      email: ' Smoke.User@NOVA.demo ',
      password: 'SmokePass123!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Smoke User');
      expect(result.data.email).toBe('smoke.user@nova.demo');
    }
  });

  it('rejects registration with password under minimum length', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@nova.demo',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects registration with a malformed email address', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email',
      password: 'ValidPassword123!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects registration with a blank name', () => {
    const result = registerSchema.safeParse({
      name: '   ',
      email: 'test@nova.demo',
      password: 'ValidPassword123!',
    });
    expect(result.success).toBe(false);
  });
});

describe('SMOKE: Authentication — Input Validation (Login)', () => {
  it('accepts valid login credentials and normalises email', () => {
    const result = loginSchema.safeParse({
      email: '  OWNER@NOVA.DEMO  ',
      password: 'NovaDemo123!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('owner@nova.demo');
    }
  });

  it('rejects login with an empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@nova.demo', password: '' });
    expect(result.success).toBe(false);
  });
});

// ─── Authorization: Role hierarchy ───────────────────────────────────────────

describe('SMOKE: Authorization — Workspace Role Hierarchy', () => {
  it('all roles (OWNER, ADMIN, MEMBER) can create projects', () => {
    expect(canCreateProject('OWNER')).toBe(true);
    expect(canCreateProject('ADMIN')).toBe(true);
    expect(canCreateProject('MEMBER')).toBe(true);
  });

  it('only OWNER and ADMIN can manage projects; MEMBER cannot', () => {
    expect(canManageProject('OWNER')).toBe(true);
    expect(canManageProject('ADMIN')).toBe(true);
    expect(canManageProject('MEMBER')).toBe(false);
  });

  it('only OWNER can perform ownership-level actions', () => {
    expect(canOwnerAction('OWNER')).toBe(true);
    expect(canOwnerAction('ADMIN')).toBe(false);
    expect(canOwnerAction('MEMBER')).toBe(false);
  });
});

// ─── Project validation ───────────────────────────────────────────────────────

describe('SMOKE: Project Validation', () => {
  it('rejects a blank project name', () => {
    expect(createProjectSchema.safeParse({ name: '   ' }).success).toBe(false);
  });

  it('rejects a project name shorter than 2 characters', () => {
    expect(createProjectSchema.safeParse({ name: 'X' }).success).toBe(false);
  });

  it('accepts valid project data and trims whitespace', () => {
    const result = createProjectSchema.safeParse({ name: '  Smoke Project  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Smoke Project');
  });

  it('rejects an invalid project status value', () => {
    expect(updateProjectSchema.safeParse({ status: 'DELETED' }).success).toBe(false);
  });

  it('accepts valid status transitions', () => {
    expect(updateProjectSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(updateProjectSchema.safeParse({ status: 'ARCHIVED' }).success).toBe(true);
  });
});

// ─── Task validation ──────────────────────────────────────────────────────────

describe('SMOKE: Task Validation', () => {
  it('rejects a task with a blank title', () => {
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('accepts a valid task and trims title', () => {
    const result = createTaskSchema.safeParse({ title: '  Fix auth bug  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe('Fix auth bug');
  });

  it('rejects a task with a non-UUID assigneeId (IDOR guard)', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid Task',
      assigneeId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty task update payload', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a valid task status update', () => {
    expect(updateTaskSchema.safeParse({ status: 'DONE' }).success).toBe(true);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('SMOKE: Error Handling — AppError factory and normalization', () => {
  it('AppError factories produce correct status codes and codes', () => {
    expect(Errors.badRequest('x').status).toBe(400);
    expect(Errors.unauthorized('x').status).toBe(401);
    expect(Errors.forbidden('x').status).toBe(403);
    expect(Errors.notFound('x').status).toBe(404);
    expect(Errors.conflict('x').status).toBe(409);
    expect(Errors.validation('x').status).toBe(422);
  });

  it('getErrorMessage extracts message from AppError', () => {
    const err = Errors.forbidden('Workspace access denied');
    expect(getErrorMessage(err)).toBe('Workspace access denied');
  });

  it('getErrorMessage extracts message from ApiError', () => {
    expect(getErrorMessage(new ApiError(401, 'Session expired'))).toBe('Session expired');
  });

  it('getErrorMessage returns fallback for null/undefined', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred.');
  });

  it('getErrorMessage NEVER returns "[object Event]" or "[object Object]"', () => {
    const fakeEvent = { type: 'error', toString: () => '[object Event]' };
    const msg = getErrorMessage(fakeEvent);
    expect(msg).not.toBe('[object Event]');
    expect(msg).not.toBe('[object Object]');
  });
});
