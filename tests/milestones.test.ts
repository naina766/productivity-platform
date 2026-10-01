import { createMilestoneSchema, updateMilestoneSchema } from '../lib/validations/milestone';
import { serializeMilestone } from '../lib/milestones/milestone.service';

describe('Milestones — Validation & Serialization', () => {
  describe('createMilestoneSchema', () => {
    it('accepts valid milestone title and description', () => {
      const res = createMilestoneSchema.safeParse({
        title: '   Alpha Release Milestone   ',
        description: 'Target for internal testing',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Alpha Release Milestone');
        expect(res.data.description).toBe('Target for internal testing');
      }
    });

    it('rejects blank title', () => {
      const res1 = createMilestoneSchema.safeParse({ title: '' });
      expect(res1.success).toBe(false);

      const res2 = createMilestoneSchema.safeParse({ title: '   ' });
      expect(res2.success).toBe(false);
    });

    it('accepts valid ISO due date string or null', () => {
      const res1 = createMilestoneSchema.safeParse({
        title: 'Q4 Launch',
        dueDate: '2026-11-01T00:00:00.000Z',
      });
      expect(res1.success).toBe(true);

      const res2 = createMilestoneSchema.safeParse({
        title: 'No Deadline Milestone',
        dueDate: null,
      });
      expect(res2.success).toBe(true);
    });
  });

  describe('updateMilestoneSchema', () => {
    it('accepts valid partial updates', () => {
      const res1 = updateMilestoneSchema.safeParse({ title: 'Updated Milestone' });
      expect(res1.success).toBe(true);

      const res2 = updateMilestoneSchema.safeParse({ status: 'COMPLETED' });
      expect(res2.success).toBe(true);

      const res3 = updateMilestoneSchema.safeParse({ description: null, dueDate: null });
      expect(res3.success).toBe(true);
    });

    it('rejects empty update objects', () => {
      const res = updateMilestoneSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe('serializeMilestone', () => {
    it('computes 0% progress when milestone has no tasks', () => {
      const now = new Date('2026-10-01T12:00:00.000Z');
      const serialized = serializeMilestone({
        id: 'm-1',
        projectId: 'p-1',
        title: 'Kickoff',
        description: null,
        dueDate: null,
        status: 'OPEN',
        tasks: [],
        createdAt: now,
        updatedAt: now,
      });

      expect(serialized.id).toBe('m-1');
      expect(serialized.taskCount).toBe(0);
      expect(serialized.completedTaskCount).toBe(0);
      expect(serialized.progressPercentage).toBe(0);
      expect(serialized.dueDate).toBeNull();
    });

    it('computes correct progress percentage from task statuses', () => {
      const now = new Date('2026-10-01T12:00:00.000Z');
      const serialized = serializeMilestone({
        id: 'm-2',
        projectId: 'p-1',
        title: 'Beta Release',
        description: 'Beta scope',
        dueDate: new Date('2026-10-15T00:00:00.000Z'),
        status: 'OPEN',
        tasks: [
          { status: 'DONE' },
          { status: 'DONE' },
          { status: 'IN_PROGRESS' },
          { status: 'TODO' },
        ],
        createdAt: now,
        updatedAt: now,
      });

      expect(serialized.taskCount).toBe(4);
      expect(serialized.completedTaskCount).toBe(2);
      expect(serialized.progressPercentage).toBe(50);
      expect(serialized.dueDate).toBe('2026-10-15T00:00:00.000Z');
    });
  });
});
