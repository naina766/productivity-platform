import { canManageProject, canOwnerAction } from '../lib/projects/permissions';
import { roleRank } from '../lib/workspaces/permissions';

describe('Permissions — Workspace Role Capabilities', () => {
  describe('roleRank()', () => {
    it('orders roles OWNER > ADMIN > MEMBER', () => {
      expect(roleRank('OWNER')).toBeGreaterThan(roleRank('ADMIN'));
      expect(roleRank('ADMIN')).toBeGreaterThan(roleRank('MEMBER'));
    });
  });

  describe('canManageProject()', () => {
    it('denies MEMBER from managing project settings', () => {
      expect(canManageProject('MEMBER')).toBe(false);
    });

    it('allows ADMIN to manage project settings', () => {
      expect(canManageProject('ADMIN')).toBe(true);
    });

    it('allows OWNER to manage project settings', () => {
      expect(canManageProject('OWNER')).toBe(true);
    });
  });

  describe('canOwnerAction()', () => {
    it('denies MEMBER from performing ownership-level actions', () => {
      expect(canOwnerAction('MEMBER')).toBe(false);
    });

    it('denies ADMIN from performing ownership-level actions', () => {
      expect(canOwnerAction('ADMIN')).toBe(false);
    });

    it('allows OWNER to perform ownership-level actions', () => {
      expect(canOwnerAction('OWNER')).toBe(true);
    });
  });
});
