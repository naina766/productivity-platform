import {
  calculateNextOccurrence,
  shouldSpawnNextOccurrence,
  RECURRENCE_LABELS,
  RECURRENCE_INTERVALS,
} from '../lib/tasks/recurring';
import { createTaskSchema, updateTaskSchema } from '../lib/validations/task';

describe('Recurring Tasks — Calculations & Validations', () => {
  describe('calculateNextOccurrence', () => {
    it('calculates next DAILY occurrence correctly', () => {
      const base = new Date('2026-10-01T10:00:00.000Z');
      const after = new Date('2026-10-01T10:00:00.000Z');
      const next = calculateNextOccurrence(base, 'DAILY', after);

      expect(next.toISOString()).toBe('2026-10-02T10:00:00.000Z');
    });

    it('calculates next WEEKLY occurrence correctly (+7 days)', () => {
      const base = new Date('2026-10-01T10:00:00.000Z');
      const after = new Date('2026-10-01T10:00:00.000Z');
      const next = calculateNextOccurrence(base, 'WEEKLY', after);

      expect(next.toISOString()).toBe('2026-10-08T10:00:00.000Z');
    });

    it('calculates next BIWEEKLY occurrence correctly (+14 days)', () => {
      const base = new Date('2026-10-01T10:00:00.000Z');
      const after = new Date('2026-10-01T10:00:00.000Z');
      const next = calculateNextOccurrence(base, 'BIWEEKLY', after);

      expect(next.toISOString()).toBe('2026-10-15T10:00:00.000Z');
    });

    it('calculates next MONTHLY occurrence correctly and clamps end-of-month', () => {
      const base = new Date('2026-01-31T10:00:00.000Z');
      const after = new Date('2026-01-31T10:00:00.000Z');
      const next = calculateNextOccurrence(base, 'MONTHLY', after);

      // In 2026, February has 28 days
      expect(next.getUTCMonth()).toBe(1); // 1 = February
      expect(next.getUTCDate()).toBe(28);
    });

    it('calculates next YEARLY occurrence correctly (+1 year)', () => {
      const base = new Date('2026-10-01T10:00:00.000Z');
      const after = new Date('2026-10-01T10:00:00.000Z');
      const next = calculateNextOccurrence(base, 'YEARLY', after);

      expect(next.toISOString()).toBe('2027-10-01T10:00:00.000Z');
    });

    it('advances a stale / overdue date into the future relative to afterDate', () => {
      const staleDueDate = new Date('2026-01-01T10:00:00.000Z');
      const today = new Date('2026-10-01T12:00:00.000Z');
      const next = calculateNextOccurrence(staleDueDate, 'WEEKLY', today);

      expect(next.getTime()).toBeGreaterThan(today.getTime());
      // The day of week should match Thursday (Jan 1, 2026 was Thursday)
      expect(next.getUTCDay()).toBe(staleDueDate.getUTCDay());
    });
  });

  describe('shouldSpawnNextOccurrence', () => {
    it('returns true when recurrenceEndDate is null', () => {
      const nextDate = new Date('2026-11-01T00:00:00.000Z');
      expect(shouldSpawnNextOccurrence(nextDate, null)).toBe(true);
    });

    it('returns true when nextDueDate is on or before recurrenceEndDate', () => {
      const nextDate = new Date('2026-11-01T00:00:00.000Z');
      const endDate = new Date('2026-11-01T00:00:00.000Z');
      expect(shouldSpawnNextOccurrence(nextDate, endDate)).toBe(true);

      const laterEndDate = new Date('2026-12-01T00:00:00.000Z');
      expect(shouldSpawnNextOccurrence(nextDate, laterEndDate)).toBe(true);
    });

    it('returns false when nextDueDate exceeds recurrenceEndDate', () => {
      const nextDate = new Date('2026-11-02T00:00:00.000Z');
      const endDate = new Date('2026-11-01T00:00:00.000Z');
      expect(shouldSpawnNextOccurrence(nextDate, endDate)).toBe(false);
    });
  });

  describe('Validation schemas', () => {
    it('accepts recurring task creation with recurrence fields', () => {
      const res = createTaskSchema.safeParse({
        title: 'Weekly Standup Notes',
        isRecurring: true,
        recurrenceInterval: 'WEEKLY',
        recurrenceEndDate: '2026-12-31T23:59:59.000Z',
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isRecurring).toBe(true);
        expect(res.data.recurrenceInterval).toBe('WEEKLY');
      }
    });

    it('accepts recurring task updates', () => {
      const res = updateTaskSchema.safeParse({
        isRecurring: true,
        recurrenceInterval: 'MONTHLY',
      });

      expect(res.success).toBe(true);
    });

    it('rejects invalid recurrenceInterval value', () => {
      const res = createTaskSchema.safeParse({
        title: 'Bad Recurrence',
        isRecurring: true,
        recurrenceInterval: 'HOURLY',
      });

      expect(res.success).toBe(false);
    });
  });

  describe('Interval metadata & labels', () => {
    it('provides friendly labels for all supported recurrence intervals', () => {
      for (const interval of RECURRENCE_INTERVALS) {
        expect(RECURRENCE_LABELS[interval]).toBeDefined();
        expect(typeof RECURRENCE_LABELS[interval]).toBe('string');
      }
    });
  });
});
