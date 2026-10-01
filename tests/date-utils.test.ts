import {
  getDateBoundaries,
  isTaskOverdue,
  isTaskToday,
  isTaskUpcoming,
  classifyTask,
  buildDateViewFilter,
} from '../lib/tasks/date-utils';

describe('Date Utilities & Task View Classification', () => {
  // Use a fixed reference date: 2026-10-01 12:00:00 UTC
  const fixedRef = new Date('2026-10-01T12:00:00.000Z');

  describe('getDateBoundaries', () => {
    it('returns start and end of day without timezone offset', () => {
      const boundaries = getDateBoundaries(fixedRef);
      expect(boundaries.startOfToday.getHours()).toBe(0);
      expect(boundaries.startOfToday.getMinutes()).toBe(0);
      expect(boundaries.startOfToday.getSeconds()).toBe(0);
      expect(boundaries.startOfToday.getMilliseconds()).toBe(0);

      expect(boundaries.endOfToday.getHours()).toBe(23);
      expect(boundaries.endOfToday.getMinutes()).toBe(59);
      expect(boundaries.endOfToday.getSeconds()).toBe(59);
      expect(boundaries.endOfToday.getMilliseconds()).toBe(999);
      expect(boundaries.endOfToday.getTime()).toBeGreaterThan(boundaries.startOfToday.getTime());
    });

    it('correctly shifts boundaries when timezoneOffsetMinutes is provided (e.g. UTC+5:30 -> -330)', () => {
      // For IST (UTC+5:30), offset is -330 minutes.
      // 2026-10-01 12:00:00 UTC is 17:30 IST on 2026-10-01.
      // Start of day in IST is 2026-10-01 00:00:00 IST = 2026-09-30 18:30:00 UTC.
      const boundaries = getDateBoundaries(fixedRef, -330);
      expect(boundaries.startOfToday.toISOString()).toBe('2026-09-30T18:30:00.000Z');
      expect(boundaries.endOfToday.toISOString()).toBe('2026-10-01T18:29:59.999Z');
    });

    it('correctly shifts boundaries for negative UTC offset (e.g. EDT UTC-4 -> +240)', () => {
      // 2026-10-01 12:00:00 UTC is 08:00 EDT on 2026-10-01.
      // Start of day in EDT is 2026-10-01 00:00:00 EDT = 2026-10-01 04:00:00 UTC.
      const boundaries = getDateBoundaries(fixedRef, 240);
      expect(boundaries.startOfToday.toISOString()).toBe('2026-10-01T04:00:00.000Z');
      expect(boundaries.endOfToday.toISOString()).toBe('2026-10-02T03:59:59.999Z');
    });
  });

  describe('isTaskOverdue', () => {
    const boundaries = {
      startOfToday: new Date('2026-10-01T00:00:00.000Z'),
      endOfToday: new Date('2026-10-01T23:59:59.999Z'),
    };

    it('returns true when dueDate is before startOfToday and status is TODO', () => {
      expect(isTaskOverdue('2026-09-30T23:59:59.000Z', 'TODO', boundaries)).toBe(true);
      expect(isTaskOverdue('2026-09-15T10:00:00.000Z', 'IN_PROGRESS', boundaries)).toBe(true);
      expect(isTaskOverdue('2026-09-20T00:00:00.000Z', 'IN_REVIEW', boundaries)).toBe(true);
    });

    it('returns false when task status is DONE, even if past dueDate', () => {
      expect(isTaskOverdue('2026-09-30T23:59:59.000Z', 'DONE', boundaries)).toBe(false);
      expect(isTaskOverdue('2026-01-01T00:00:00.000Z', 'DONE', boundaries)).toBe(false);
    });

    it('returns false when dueDate is today', () => {
      expect(isTaskOverdue('2026-10-01T08:00:00.000Z', 'TODO', boundaries)).toBe(false);
      expect(isTaskOverdue('2026-10-01T23:59:00.000Z', 'TODO', boundaries)).toBe(false);
    });

    it('returns false when dueDate is in the future', () => {
      expect(isTaskOverdue('2026-10-05T00:00:00.000Z', 'TODO', boundaries)).toBe(false);
    });

    it('returns false when dueDate is null or undefined', () => {
      expect(isTaskOverdue(null, 'TODO', boundaries)).toBe(false);
      expect(isTaskOverdue(undefined, 'TODO', boundaries)).toBe(false);
    });
  });

  describe('isTaskToday', () => {
    const boundaries = {
      startOfToday: new Date('2026-10-01T00:00:00.000Z'),
      endOfToday: new Date('2026-10-01T23:59:59.999Z'),
    };

    it('returns true when dueDate falls within startOfToday and endOfToday inclusive', () => {
      expect(isTaskToday('2026-10-01T00:00:00.000Z', boundaries)).toBe(true);
      expect(isTaskToday('2026-10-01T14:30:00.000Z', boundaries)).toBe(true);
      expect(isTaskToday('2026-10-01T23:59:59.999Z', boundaries)).toBe(true);
    });

    it('returns false when dueDate is before startOfToday', () => {
      expect(isTaskToday('2026-09-30T23:59:59.999Z', boundaries)).toBe(false);
    });

    it('returns false when dueDate is after endOfToday', () => {
      expect(isTaskToday('2026-10-02T00:00:00.000Z', boundaries)).toBe(false);
    });

    it('returns false when dueDate is null or undefined', () => {
      expect(isTaskToday(null, boundaries)).toBe(false);
      expect(isTaskToday(undefined, boundaries)).toBe(false);
    });
  });

  describe('isTaskUpcoming', () => {
    const boundaries = {
      startOfToday: new Date('2026-10-01T00:00:00.000Z'),
      endOfToday: new Date('2026-10-01T23:59:59.999Z'),
    };

    it('returns true when dueDate is strictly after endOfToday', () => {
      expect(isTaskUpcoming('2026-10-02T00:00:00.000Z', boundaries)).toBe(true);
      expect(isTaskUpcoming('2026-10-15T12:00:00.000Z', boundaries)).toBe(true);
    });

    it('returns false when dueDate is today', () => {
      expect(isTaskUpcoming('2026-10-01T15:00:00.000Z', boundaries)).toBe(false);
      expect(isTaskUpcoming('2026-10-01T23:59:59.999Z', boundaries)).toBe(false);
    });

    it('returns false when dueDate is in the past (overdue)', () => {
      expect(isTaskUpcoming('2026-09-30T10:00:00.000Z', boundaries)).toBe(false);
    });

    it('returns false when dueDate is null or undefined', () => {
      expect(isTaskUpcoming(null, boundaries)).toBe(false);
    });
  });

  describe('classifyTask', () => {
    const boundaries = {
      startOfToday: new Date('2026-10-01T00:00:00.000Z'),
      endOfToday: new Date('2026-10-01T23:59:59.999Z'),
    };

    it('classifies overdue tasks correctly', () => {
      expect(
        classifyTask({ dueDate: '2026-09-25T00:00:00.000Z', status: 'TODO' }, boundaries)
      ).toBe('OVERDUE');
    });

    it('classifies today tasks correctly', () => {
      expect(
        classifyTask({ dueDate: '2026-10-01T10:00:00.000Z', status: 'IN_PROGRESS' }, boundaries)
      ).toBe('TODAY');
    });

    it('classifies upcoming tasks correctly', () => {
      expect(
        classifyTask({ dueDate: '2026-10-05T00:00:00.000Z', status: 'TODO' }, boundaries)
      ).toBe('UPCOMING');
    });

    it('classifies tasks without due date correctly', () => {
      expect(classifyTask({ dueDate: null, status: 'TODO' }, boundaries)).toBe('NO_DUE_DATE');
    });

    it('does not classify completed past tasks as OVERDUE', () => {
      expect(
        classifyTask({ dueDate: '2026-09-25T00:00:00.000Z', status: 'DONE' }, boundaries)
      ).not.toBe('OVERDUE');
    });
  });

  describe('buildDateViewFilter', () => {
    const boundaries = {
      startOfToday: new Date('2026-10-01T00:00:00.000Z'),
      endOfToday: new Date('2026-10-01T23:59:59.999Z'),
    };

    it('builds overdue filter with status not DONE and dueDate < startOfToday', () => {
      const filter = buildDateViewFilter('overdue', boundaries);
      expect(filter).toEqual({
        status: { not: 'DONE' },
        dueDate: { lt: boundaries.startOfToday },
      });
    });

    it('builds today filter with dueDate within range', () => {
      const filter = buildDateViewFilter('today', boundaries);
      expect(filter).toEqual({
        dueDate: {
          gte: boundaries.startOfToday,
          lte: boundaries.endOfToday,
        },
      });
    });

    it('builds upcoming filter with dueDate > endOfToday', () => {
      const filter = buildDateViewFilter('upcoming', boundaries);
      expect(filter).toEqual({
        dueDate: {
          gt: boundaries.endOfToday,
        },
      });
    });

    it('builds empty filter for all view', () => {
      const filter = buildDateViewFilter('all', boundaries);
      expect(filter).toEqual({});
    });
  });
});
