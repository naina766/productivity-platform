import { createInvitationSchema } from '@/lib/validations/invitation';
import { serializeInvitation } from '@/lib/workspaces/invitation.service';

describe('Workspace Invitations', () => {
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

  describe('Serialization', () => {
    it('serializes database invitation into client item with inviteUrl', () => {
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
  });
});
