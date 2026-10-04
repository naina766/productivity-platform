import { createInvitationSchema } from '@/lib/validations/invitation';
import {
  serializeInvitation,
  hashInvitationToken,
  getInvitationByToken,
  acceptWorkspaceInvitation,
} from '@/lib/workspaces/invitation.service';
import { prisma } from '@/lib/db/prisma';

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    workspaceInvitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('Workspace Invitations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Schema', () => {
    it('accepts valid email and normalizes to lowercase and trimmed', () => {
      const payload = {
        email: '  NewTeammate@Company.COM  ',
        role: 'ADMIN' as const,
      };

      const res = createInvitationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.email).toBe('newteammate@company.com');
        expect(res.data.role).toBe('ADMIN');
      }
    });

    it('defaults role to MEMBER if omitted', () => {
      const payload = {
        email: 'developer@startup.io',
      };

      const res = createInvitationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.role).toBe('MEMBER');
      }
    });

    it('rejects invalid email formats', () => {
      const invalidEmails = ['plainaddress', 'missing@domain', '@missinguser.com', 'spaces in@mail.com'];
      for (const email of invalidEmails) {
        const res = createInvitationSchema.safeParse({ email });
        expect(res.success).toBe(false);
      }
    });
  });

  describe('Token Hashing Security', () => {
    it('hashes raw invitation token into 64-char SHA-256 hex string', () => {
      const rawToken = '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a';
      const hash = hashInvitationToken(rawToken);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash).not.toBe(rawToken);
    });

    it('produces deterministic hash for identical tokens', () => {
      const rawToken = 'secure-random-invitation-token-123';
      expect(hashInvitationToken(rawToken)).toBe(hashInvitationToken(rawToken));
    });

    it('different tokens produce different hashes', () => {
      const t1 = 'token-alpha';
      const t2 = 'token-beta';
      expect(hashInvitationToken(t1)).not.toBe(hashInvitationToken(t2));
    });
  });

  describe('Serialization', () => {
    it('serializes database invitation into client item with inviteUrl when raw token is present', () => {
      const now = new Date('2026-10-01T10:00:00.000Z');
      const expires = new Date('2026-10-08T10:00:00.000Z');

      const raw = {
        id: '11111111-1111-1111-1111-111111111111',
        workspaceId: '22222222-2222-2222-2222-222222222222',
        email: 'engineer@team.com',
        role: 'MEMBER',
        token: 'abcd1234efgh5678ijkl9012',
        invitedById: '33333333-3333-3333-3333-333333333333',
        status: 'PENDING',
        expiresAt: expires,
        acceptedAt: null,
        createdAt: now,
        workspace: { name: 'Acme Corp' },
        invitedBy: { name: 'Sarah Connor' },
      };

      const serialized = serializeInvitation(raw);

      expect(serialized.id).toBe(raw.id);
      expect(serialized.workspaceName).toBe('Acme Corp');
      expect(serialized.invitedByName).toBe('Sarah Connor');
      expect(serialized.email).toBe('engineer@team.com');
      expect(serialized.role).toBe('MEMBER');
      expect(serialized.token).toBe('abcd1234efgh5678ijkl9012');
      expect(serialized.inviteUrl).toBe('/invite/abcd1234efgh5678ijkl9012');
      expect(serialized.status).toBe('PENDING');
      expect(serialized.acceptedAt).toBeNull();
      expect(serialized.createdAt).toBe('2026-10-01T10:00:00.000Z');
      expect(serialized.expiresAt).toBe('2026-10-08T10:00:00.000Z');
    });

    it('serializes database record safely without leaking raw token if not provided', () => {
      const raw = {
        id: '11111111-1111-1111-1111-111111111111',
        workspaceId: '22222222-2222-2222-2222-222222222222',
        email: 'engineer@team.com',
        role: 'MEMBER',
        tokenHash: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        invitedById: '33333333-3333-3333-3333-333333333333',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 100000),
        acceptedAt: null,
        createdAt: new Date(),
      };

      const serialized = serializeInvitation(raw);
      expect(serialized.token).toBe('');
      expect(serialized.inviteUrl).toBeUndefined();
    });
  });

  describe('Lookup & Verification via Hash', () => {
    it('queries database by tokenHash, never raw token', async () => {
      const rawToken = 'my-raw-invitation-token';
      const expectedHash = hashInvitationToken(rawToken);

      (prisma.workspaceInvitation.findUnique as jest.Mock).mockResolvedValue({
        id: 'inv-1',
        workspaceId: 'ws-1',
        email: 'invitee@test.com',
        role: 'MEMBER',
        tokenHash: expectedHash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 3600000),
        workspace: { name: 'Acme Test' },
        invitedBy: { name: 'Alice Admin' },
      });

      const details = await getInvitationByToken(rawToken);

      expect(prisma.workspaceInvitation.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: expectedHash },
        include: expect.any(Object),
      });
      expect(details.workspaceName).toBe('Acme Test');
      expect(details.isExpired).toBe(false);
    });

    it('rejects lookup when token is not found', async () => {
      (prisma.workspaceInvitation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getInvitationByToken('unknown-token')).rejects.toThrow('Invitation not found');
    });

    it('marks expired invitations appropriately', async () => {
      const rawToken = 'expired-raw-token';
      const expectedHash = hashInvitationToken(rawToken);

      (prisma.workspaceInvitation.findUnique as jest.Mock).mockResolvedValue({
        id: 'inv-expired',
        workspaceId: 'ws-1',
        email: 'invitee@test.com',
        role: 'MEMBER',
        tokenHash: expectedHash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 3600000), // in the past
        workspace: { name: 'Acme Test' },
        invitedBy: { name: 'Alice Admin' },
      });

      const details = await getInvitationByToken(rawToken);
      expect(details.isExpired).toBe(true);
      expect(details.status).toBe('EXPIRED');
    });
  });

  describe('Acceptance Authorization & Edge Cases', () => {
    it('rejects already accepted invitation', async () => {
      (prisma.workspaceInvitation.findUnique as jest.Mock).mockResolvedValue({
        id: 'inv-accepted',
        status: 'ACCEPTED',
        expiresAt: new Date(Date.now() + 3600000),
        workspace: { id: 'ws-1', name: 'Acme' },
        invitedBy: { name: 'Admin' },
      });

      await expect(acceptWorkspaceInvitation('token-accepted', 'user-1')).rejects.toThrow(
        'This invitation has already been accepted.'
      );
    });

    it('rejects revoked invitation', async () => {
      (prisma.workspaceInvitation.findUnique as jest.Mock).mockResolvedValue({
        id: 'inv-revoked',
        status: 'REVOKED',
        expiresAt: new Date(Date.now() + 3600000),
        workspace: { id: 'ws-1', name: 'Acme' },
        invitedBy: { name: 'Admin' },
      });

      await expect(acceptWorkspaceInvitation('token-revoked', 'user-1')).rejects.toThrow(
        'This invitation has been revoked'
      );
    });

    it('rejects expired invitation on acceptance', async () => {
      (prisma.workspaceInvitation.findUnique as jest.Mock).mockResolvedValue({
        id: 'inv-expired',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000),
        workspace: { id: 'ws-1', name: 'Acme' },
        invitedBy: { name: 'Admin' },
      });

      await expect(acceptWorkspaceInvitation('token-expired', 'user-1')).rejects.toThrow(
        'This invitation has expired.'
      );
    });
  });
});
