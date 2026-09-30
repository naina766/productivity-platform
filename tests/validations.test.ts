import { createProjectSchema, updateProjectSchema } from '../lib/validations/project';
import { createTaskSchema, updateTaskSchema } from '../lib/validations/task';
import { createCommentSchema } from '../lib/validations/comment';
import { addWorkspaceMemberSchema } from '../lib/validations/workspace';

describe('Validations — Project Schema', () => {
  it('accepts valid input and trims whitespace from name and description', () => {
    const result = createProjectSchema.safeParse({
      name: '  Infrastructure Migration  ',
      description: '  Upgrade databases to PostgreSQL 16  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Infrastructure Migration');
      expect(result.data.description).toBe('Upgrade databases to PostgreSQL 16');
    }
  });

  it('rejects a blank project name', () => {
    const result = createProjectSchema.safeParse({ name: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a project name shorter than 2 characters', () => {
    const result = createProjectSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid status and priority update', () => {
    const result = updateProjectSchema.safeParse({ status: 'ACTIVE', priority: 'HIGH' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    const result = updateProjectSchema.safeParse({ status: 'NONEXISTENT_STATUS' });
    expect(result.success).toBe(false);
  });
});

describe('Validations — Task Schema', () => {
  it('accepts valid task input and trims the title', () => {
    const result = createTaskSchema.safeParse({
      title: '  Implement auth retry logic  ',
      description: 'Ensure 401 triggers token refresh and single retry',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: '2026-10-15T00:00:00.000Z',
      assigneeId: '00000000-0000-4000-8000-000000000001',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Implement auth retry logic');
      expect(result.data.status).toBe('IN_PROGRESS');
      expect(result.data.priority).toBe('URGENT');
    }
  });

  it('rejects a whitespace-only task title', () => {
    const result = createTaskSchema.safeParse({ title: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-UUID assigneeId', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid Title',
      assigneeId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid dueDate string', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid Title',
      dueDate: 'invalid-date-string',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid task update', () => {
    const result = updateTaskSchema.safeParse({ status: 'DONE', title: 'Updated title' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty task update payload', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('Validations — Comment Schema', () => {
  it('accepts a valid comment and trims whitespace', () => {
    const result = createCommentSchema.safeParse({
      content: '  This is a constructive feedback comment.  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('This is a constructive feedback comment.');
    }
  });

  it('rejects a whitespace-only comment', () => {
    const result = createCommentSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
  });
});

describe('Validations — Workspace Member Schema', () => {
  it('accepts valid email and role, trimming email whitespace', () => {
    const result = addWorkspaceMemberSchema.safeParse({
      email: ' teammate@nova.demo ',
      role: 'ADMIN',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('teammate@nova.demo');
      expect(result.data.role).toBe('ADMIN');
    }
  });

  it('rejects a non-permitted role', () => {
    const result = addWorkspaceMemberSchema.safeParse({
      email: 'teammate@nova.demo',
      role: 'SUPERADMIN',
    });
    expect(result.success).toBe(false);
  });
});
