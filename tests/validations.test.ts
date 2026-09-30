import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectSchema, updateProjectSchema } from '../lib/validations/project';
import { createTaskSchema, updateTaskSchema } from '../lib/validations/task';
import { createCommentSchema } from '../lib/validations/comment';
import { addWorkspaceMemberSchema } from '../lib/validations/workspace';

test('Validations — Project Schema', () => {
  // Valid project
  const valid = createProjectSchema.safeParse({
    name: '  Infrastructure Migration  ',
    description: '  Upgrade databases to PostgreSQL 16  ',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.name, 'Infrastructure Migration');
    assert.equal(valid.data.description, 'Upgrade databases to PostgreSQL 16');
  }

  // Empty name rejection
  const emptyName = createProjectSchema.safeParse({
    name: '   ',
  });
  assert.equal(emptyName.success, false, 'Blank project name must be rejected');

  // Short name rejection
  const shortName = createProjectSchema.safeParse({
    name: 'A',
  });
  assert.equal(shortName.success, false, 'Project name shorter than 2 chars must be rejected');

  // Update status and priority
  const updateValid = updateProjectSchema.safeParse({
    status: 'ACTIVE',
    priority: 'HIGH',
  });
  assert.equal(updateValid.success, true);

  const invalidStatus = updateProjectSchema.safeParse({
    status: 'NONEXISTENT_STATUS',
  });
  assert.equal(invalidStatus.success, false);
});

test('Validations — Task Schema', () => {
  // Valid task
  const valid = createTaskSchema.safeParse({
    title: '  Implement auth retry logic  ',
    description: 'Ensure 401 triggers token refresh and single retry',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dueDate: '2026-10-15T00:00:00.000Z',
    assigneeId: '00000000-0000-4000-8000-000000000001',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.title, 'Implement auth retry logic');
    assert.equal(valid.data.status, 'IN_PROGRESS');
    assert.equal(valid.data.priority, 'URGENT');
  }

  // Empty title rejection
  const emptyTitle = createTaskSchema.safeParse({
    title: '   ',
  });
  assert.equal(emptyTitle.success, false, 'Empty task title must be rejected');

  // Invalid UUID assigneeId rejection
  const invalidUUID = createTaskSchema.safeParse({
    title: 'Valid Title',
    assigneeId: 'not-a-uuid',
  });
  assert.equal(invalidUUID.success, false, 'Non-UUID assigneeId must be rejected');

  // Invalid date format
  const invalidDate = createTaskSchema.safeParse({
    title: 'Valid Title',
    dueDate: 'invalid-date-string',
  });
  assert.equal(invalidDate.success, false, 'Invalid datetime string must be rejected');
});

test('Validations — Comment Schema', () => {
  // Valid comment
  const valid = createCommentSchema.safeParse({
    content: '  This is a constructive feedback comment.  ',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.content, 'This is a constructive feedback comment.');
  }

  // Empty comment rejection
  const emptyComment = createCommentSchema.safeParse({
    content: '   ',
  });
  assert.equal(emptyComment.success, false, 'Empty comment content must be rejected');
});

test('Validations — Workspace Member Schema', () => {
  const valid = addWorkspaceMemberSchema.safeParse({
    email: ' teammate@nova.demo ',
    role: 'ADMIN',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.email, 'teammate@nova.demo');
    assert.equal(valid.data.role, 'ADMIN');
  }

  const invalidRole = addWorkspaceMemberSchema.safeParse({
    email: 'teammate@nova.demo',
    role: 'SUPERADMIN',
  });
  assert.equal(invalidRole.success, false, 'Non-permitted role must be rejected');
});
