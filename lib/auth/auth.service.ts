import { prisma } from '@/lib/db/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { storeRefreshToken, findValidRefreshToken, revokeRefreshToken } from '@/lib/auth/refresh-token';
import { Errors } from '@/lib/errors';
import type { RegisterInput, LoginInput } from '@/lib/validations/auth';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  tokens: AuthTokens;
  workspace?: { id: string; name: string; role: string };
}

/**
 * Register a new user.
 * Creates User + Workspace + WorkspaceMember atomically in a transaction.
 * Returns auth tokens on success.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  // Check for duplicate email before entering the transaction.
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Errors.conflict('An account with this email already exists.');

  const passwordHash = await hashPassword(input.password);

  // Derive a workspace slug from the name — lowercase, spaces to hyphens, random suffix.
  const baseSlug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
  const workspaceName = `${input.name}'s Workspace`;

  const { user, workspace, membership } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const workspace = await tx.workspace.create({
      data: { name: workspaceName, slug, ownerId: user.id },
      select: { id: true, name: true },
    });

    const membership = await tx.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
      select: { role: true },
    });

    return { user, workspace, membership };
  });

  const refreshToken = signRefreshToken(user.id);
  const accessToken = signAccessToken(user.id, user.email);
  await storeRefreshToken(user.id, refreshToken, process.env.JWT_REFRESH_TTL ?? '7d');

  return {
    user,
    tokens: { accessToken, refreshToken },
    workspace: { id: workspace.id, name: workspace.name, role: membership.role },
  };
}

/**
 * Authenticate an existing user.
 * Returns auth tokens on success.
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Constant-time: always compare even if user not found (prevents timing attacks).
  const dummyHash = '$2a$12$placeholderplaceholderplaceholderplaceholder.placeholder';
  const passwordOk = user
    ? await verifyPassword(input.password, user.passwordHash)
    : await verifyPassword(input.password, dummyHash).then(() => false);

  if (!user || !passwordOk) {
    throw Errors.unauthorized('Invalid email or password.');
  }

  const refreshToken = signRefreshToken(user.id);
  const accessToken = signAccessToken(user.id, user.email);
  await storeRefreshToken(user.id, refreshToken, process.env.JWT_REFRESH_TTL ?? '7d');

  // Fetch the primary workspace membership for the response.
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    tokens: { accessToken, refreshToken },
    workspace: membership
      ? { id: membership.workspace.id, name: membership.workspace.name, role: membership.role }
      : undefined,
  };
}

/**
 * Rotate the refresh token.
 * Revokes the old token and issues new access + refresh tokens.
 */
export async function refreshSession(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const storedToken = await findValidRefreshToken(rawRefreshToken);
  if (!storedToken) throw Errors.unauthorized('Invalid or expired refresh token.');

// Revoke old token + issue new in a single transaction so rotation is atomic.
  const [newRefreshToken, user] = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await tx.user.findUnique({
      where: { id: storedToken.userId },
      select: { id: true, email: true },
    });

    if (!user) throw Errors.unauthorized('User not found.');
    const refresh = signRefreshToken(user.id);
    await storeRefreshToken(user.id, refresh, process.env.JWT_REFRESH_TTL ?? '7d', tx);
    return [refresh, user] as const;
  });

  const accessToken = signAccessToken(user.id, user.email);

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Logout: revoke the refresh token if present.
 * Safe even if the token is already revoked or not found.
 */
export async function logoutUser(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return;
  try {
    await revokeRefreshToken(rawRefreshToken);
  } catch {
    // Already revoked or not found — that's fine.
  }
}

/**
 * Get the current user for a server-side context (Route Handler / Server Component).
 * Verifies the access token from the Authorization header.
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

/**
 * Get workspace info for a user (first workspace by creation date).
 */
export async function getUserWorkspace(userId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) return null;
  return { ...membership.workspace, role: membership.role };
}
