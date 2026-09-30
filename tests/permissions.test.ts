import test from 'node:test';
import assert from 'node:assert/strict';
import { canCreateProject, canManageProject, canOwnerAction } from '../lib/projects/permissions';

test('Permissions — Workspace Role Capabilities', () => {
  // canCreateProject: all workspace roles (OWNER, ADMIN, MEMBER) may create projects
  assert.equal(canCreateProject('MEMBER'), true, 'MEMBER should be able to create projects');
  assert.equal(canCreateProject('ADMIN'), true, 'ADMIN should be able to create projects');
  assert.equal(canCreateProject('OWNER'), true, 'OWNER should be able to create projects');

  // canManageProject: only ADMIN or OWNER may manage project settings and membership
  assert.equal(canManageProject('MEMBER'), false, 'MEMBER should not be able to manage project settings');
  assert.equal(canManageProject('ADMIN'), true, 'ADMIN should be able to manage project settings');
  assert.equal(canManageProject('OWNER'), true, 'OWNER should be able to manage project settings');

  // canOwnerAction: strictly OWNER only
  assert.equal(canOwnerAction('MEMBER'), false, 'MEMBER cannot perform ownership-level actions');
  assert.equal(canOwnerAction('ADMIN'), false, 'ADMIN cannot perform ownership-level actions');
  assert.equal(canOwnerAction('OWNER'), true, 'OWNER should be able to perform ownership-level actions');
});
