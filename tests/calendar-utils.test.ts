import {
  formatDateKey,
  getMonthDays,
  getWeekDays,
  groupTasksByDate,
  formatMonthYear,
} from '../lib/calendar/calendar-utils';

describe('Calendar Utilities', () => {
  it('formats Date to YYYY-MM-DD key accurately', () => {
    const d = new Date(2026, 9, 15); // Month 9 is October (0-indexed)
    expect(formatDateKey(d)).toBe('2026-10-15');
  });

  describe('getMonthDays', () => {
    it('generates a grid of days for October 2026 starting on Monday', () => {
      // Oct 1 2026 is a Thursday
      // In Monday-start: Mon=28, Tue=29, Wed=30 (Sep), Thu=1 (Oct)
      const fixedToday = new Date(2026, 9, 1);
      const days = getMonthDays(2026, 9, fixedToday);

      expect(days.length % 7).toBe(0);
      expect(days.length).toBeGreaterThanOrEqual(35);

      // Verify that Thursday Oct 1 is marked as today and currentMonth
      const oct1 = days.find((d) => d.dateKey === '2026-10-01');
      expect(oct1).toBeDefined();
      expect(oct1?.isCurrentMonth).toBe(true);
      expect(oct1?.isToday).toBe(true);
      expect(oct1?.dayNumber).toBe(1);

      // Verify previous month padding
      const sep30 = days.find((d) => d.dateKey === '2026-09-30');
      expect(sep30).toBeDefined();
      expect(sep30?.isCurrentMonth).toBe(false);
      expect(sep30?.dayNumber).toBe(30);

      // Verify weekend identification
      const sat = days.find((d) => d.date.getDay() === 6);
      expect(sat?.isWeekend).toBe(true);
      const mon = days.find((d) => d.date.getDay() === 1);
      expect(mon?.isWeekend).toBe(false);
    });

    it('correctly handles February in leap and non-leap years', () => {
      const nonLeapFeb = getMonthDays(2025, 1); // 2025 Feb has 28 days
      const currentDays2025 = nonLeapFeb.filter((d) => d.isCurrentMonth);
      expect(currentDays2025.length).toBe(28);

      const leapFeb = getMonthDays(2024, 1); // 2024 Feb has 29 days
      const currentDays2024 = leapFeb.filter((d) => d.isCurrentMonth);
      expect(currentDays2024.length).toBe(29);
    });
  });

  describe('getWeekDays', () => {
    it('generates 7 consecutive days starting on Monday', () => {
      const wednesday = new Date(2026, 9, 14); // Wednesday Oct 14 2026
      const week = getWeekDays(wednesday, wednesday);

      expect(week.length).toBe(7);
      expect(week[0].date.getDay()).toBe(1); // Monday
      expect(week[6].date.getDay()).toBe(0); // Sunday
      expect(week[2].isToday).toBe(true); // Wednesday
    });
  });

  describe('groupTasksByDate', () => {
    it('groups tasks by their ISO dueDate string date key', () => {
      const sampleTasks = [
        { id: '1', title: 'Task A', dueDate: '2026-10-15T10:00:00.000Z' },
        { id: '2', title: 'Task B', dueDate: '2026-10-15T15:30:00.000Z' },
        { id: '3', title: 'Task C', dueDate: '2026-10-20T00:00:00.000Z' },
        { id: '4', title: 'No due date', dueDate: null },
      ];

      const grouped = groupTasksByDate(sampleTasks);

      const oct15Tasks = grouped.get(formatDateKey(new Date('2026-10-15T10:00:00.000Z')));
      expect(oct15Tasks).toHaveLength(2);
      expect(oct15Tasks?.map((t) => t.id)).toEqual(['1', '2']);

      const oct20Tasks = grouped.get(formatDateKey(new Date('2026-10-20T00:00:00.000Z')));
      expect(oct20Tasks).toHaveLength(1);

      // Tasks without due date are ignored in date mapping
      expect(grouped.get('')).toBeUndefined();
    });
  });

  describe('formatMonthYear', () => {
    it('formats Month and Year cleanly', () => {
      const d = new Date(2026, 9, 1);
      expect(formatMonthYear(d)).toBe('October 2026');
    });
  });
});
