import { canCreateProject, canManageProject, canOwnerAction } from '../lib/projects/permissions';

describe('Permissions — Workspace Role Capabilities', () => {
  describe('canCreateProject()', () => {
    it('allows MEMBER to create projects', () => {
      expect(canCreateProject('MEMBER')).toBe(true);
    });

    it('allows ADMIN to create projects', () => {
      expect(canCreateProject('ADMIN')).toBe(true);
    });

    it('allows OWNER to create projects', () => {
      expect(canCreateProject('OWNER')).toBe(true);
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
