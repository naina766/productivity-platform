import type { TaskSummary } from '@/types/task';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  dateKey: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

/** Formats a Date object to YYYY-MM-DD in local time */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates the grid of calendar days for a given month view (Monday start).
 * Always returns 35 or 42 days (5 or 6 weeks) ensuring consistent grid dimensions.
 */
export function getMonthDays(year: number, month: number, today: Date = new Date()): CalendarDay[] {
  const todayKey = formatDateKey(today);

  // First day of target month (0-indexed month: 0=Jan, 9=Oct, etc.)
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat
  // Convert to Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    const date = new Date(year, month - 1, prevDay);
    const dateKey = formatDateKey(date);
    const dayOfWeek = date.getDay();
    days.push({
      date,
      dayNumber: prevDay,
      dateKey,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = formatDateKey(date);
    const dayOfWeek = date.getDay();
    days.push({
      date,
      dayNumber: d,
      dateKey,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Next month padding (complete grid to multiple of 7, at least 35 days)
  const totalNeeded = Math.ceil(days.length / 7) * 7;
  const nextMonthPadding = totalNeeded - days.length;
  for (let n = 1; n <= nextMonthPadding; n++) {
    const date = new Date(year, month + 1, n);
    const dateKey = formatDateKey(date);
    const dayOfWeek = date.getDay();
    days.push({
      date,
      dayNumber: n,
      dateKey,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  return days;
}

/**
 * Generates the 7 days of the week containing referenceDate (Monday start).
 */
export function getWeekDays(referenceDate: Date, today: Date = new Date()): CalendarDay[] {
  const todayKey = formatDateKey(today);
  const currentDayOfWeek = (referenceDate.getDay() + 6) % 7; // 0=Mon, 6=Sun

  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - currentDayOfWeek);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateKey = formatDateKey(date);
    const dayOfWeek = date.getDay();

    days.push({
      date,
      dayNumber: date.getDate(),
      dateKey,
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
      isToday: dateKey === todayKey,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  return days;
}

/** Groups tasks by their dueDate's YYYY-MM-DD key */
export function groupTasksByDate<T extends { dueDate: string | null }>(
  tasks: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const task of tasks) {
    if (!task.dueDate) continue;
    // Task dueDate is ISO string e.g. "2026-10-15T00:00:00.000Z"
    const key = formatDateKey(new Date(task.dueDate));
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }

  return map;
}

/** Human readable month and year, e.g. "October 2026" */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
