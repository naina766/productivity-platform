import { createSubtaskSchema, updateSubtaskSchema } from '../lib/validations/subtask';
import { serializeSubtask } from '../lib/tasks/subtask.service';

describe('Subtasks — Validation & Serialization', () => {
  describe('createSubtaskSchema', () => {
    it('accepts valid title and trims whitespace', () => {
      const res = createSubtaskSchema.safeParse({
        title: '   Write migration script   ',
        isCompleted: false,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Write migration script');
        expect(res.data.isCompleted).toBe(false);
      }
    });

    it('rejects blank or whitespace-only title', () => {
      const res1 = createSubtaskSchema.safeParse({ title: '' });
      expect(res1.success).toBe(false);

      const res2 = createSubtaskSchema.safeParse({ title: '   ' });
      expect(res2.success).toBe(false);
    });

    it('rejects titles longer than 200 characters', () => {
      const res = createSubtaskSchema.safeParse({
        title: 'A'.repeat(201),
      });
      expect(res.success).toBe(false);
    });
  });

  describe('updateSubtaskSchema', () => {
    it('accepts valid updates to title, isCompleted, or position', () => {
      const res1 = updateSubtaskSchema.safeParse({ title: 'Updated title' });
      expect(res1.success).toBe(true);

      const res2 = updateSubtaskSchema.safeParse({ isCompleted: true });
      expect(res2.success).toBe(true);

      const res3 = updateSubtaskSchema.safeParse({ position: 3 });
      expect(res3.success).toBe(true);
    });

    it('rejects empty update payloads', () => {
      const res = updateSubtaskSchema.safeParse({});
      expect(res.success).toBe(false);
    });

    it('rejects negative positions', () => {
      const res = updateSubtaskSchema.safeParse({ position: -1 });
      expect(res.success).toBe(false);
    });
  });

  describe('serializeSubtask', () => {
    it('correctly maps raw database row to SubtaskItem with ISO strings', () => {
      const now = new Date('2026-10-01T12:00:00.000Z');
      const serialized = serializeSubtask({
        id: 'sub-1',
        taskId: 'task-1',
        title: 'Verify checklist',
        isCompleted: true,
        position: 0,
        createdAt: now,
        updatedAt: now,
      });

      expect(serialized).toEqual({
        id: 'sub-1',
        taskId: 'task-1',
        title: 'Verify checklist',
        isCompleted: true,
        position: 0,
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z',
      });
    });
  });
});
