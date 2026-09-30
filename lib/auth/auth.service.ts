import { prisma } from '@/lib/db/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { storeRefreshToken, revokeRefreshToken, claimRefreshToken } from '@/lib/auth/refresh-token';
import { Errors } from '@/lib/errors';
import type { SafeUser } from '@/lib/auth/session';
import type { RegisterInput, LoginInput } from '@/lib/validations/auth';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  workspace?: { id: string; name: string; role: string };
}

const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';

function issueTokens(user: { id: string; email: string }) {
  return {
    accessToken: signAccessToken(user.id, user.email),
    refreshToken: signRefreshToken(user.id),
  };
}

/**
 * Register a user together with their first workspace.
 *
 * User, Workspace, and the OWNER membership are written in one transaction so
 * a failure can never leave an account without a workspace to work in.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) throw Errors.conflict('An account with this email already exists.');

  const passwordHash = await hashPassword(input.password);
  const slug = `${input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 8)}`;

  const { user, workspace, membership } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const workspace = await tx.workspace.create({
      data: { name: `${input.name}'s Workspace`, slug, ownerId: user.id },
      select: { id: true, name: true },
    });

    const membership = await tx.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
      select: { role: true },
    });

    return { user, workspace, membership };
  });

  const tokens = issueTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken, REFRESH_TTL);

  return {
    user,
    ...tokens,
    workspace: { id: workspace.id, name: workspace.name, role: membership.role },
  };
}

/**
 * A real bcrypt hash of a throwaway random string, used only to spend the same
 * CPU on a login for an unknown email as on a wrong password.
 *
 * The plaintext is discarded and was never a valid credential, so this grants
 * nothing. It must be a well-formed cost-12 hash: bcryptjs rejects a malformed
 * hash immediately, which would reintroduce the timing difference it exists to
 * hide.
 */
const TIMING_EQUALIZER_HASH = '$2a$12$nVmXlb16KslkZA6auvVqhejYMd3ocgQGiD1VmSYb/wNpEk.3UPDsi';

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const passwordMatches = await verifyPassword(
    input.password,
    user?.passwordHash ?? TIMING_EQUALIZER_HASH,
  );
  if (!user || !passwordMatches) {
    throw Errors.unauthorized('Invalid email or password.');
  }

  const tokens = issueTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken, REFRESH_TTL);

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    ...tokens,
    workspace: membership
      ? { id: membership.workspace.id, name: membership.workspace.name, role: membership.role }
      : undefined,
  };
}

/**
 * Rotate a refresh token and mint a new access token.
 *
 * The old token is claimed inside the same transaction that stores its
 * replacement, so a replayed token is rejected and a partially applied
 * rotation can never commit.
 */
export async function refreshSession(
  rawRefreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const rotated = await prisma.$transaction(async (tx) => {
    const userId = await claimRefreshToken(rawRefreshToken, tx);
    if (!userId) {
      throw Errors.unauthorized('Invalid, expired, or already-used refresh token.');
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) throw Errors.unauthorized('User not found.');

    // The stored expiry must match the JWT's own expiry, so both read the same TTL.
    const { refreshToken } = issueTokens(user);
    await storeRefreshToken(user.id, refreshToken, REFRESH_TTL, tx);
    return { user, refreshToken };
  });

  return {
    accessToken: signAccessToken(rotated.user.id, rotated.user.email),
    refreshToken: rotated.refreshToken,
  };
}

export async function logoutUser(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return;
  try {
    await revokeRefreshToken(rawRefreshToken);
  } catch {
    // Already revoked or unknown token — the cookie is cleared either way.
  }
}
