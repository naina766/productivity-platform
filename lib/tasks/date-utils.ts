import type { Prisma } from '@prisma/client';
import type { TaskStatus } from '@/types/task';

export interface DateBoundaries {
  startOfToday: Date;
  endOfToday: Date;
}

/**
 * Computes the start of today (00:00:00.000) and end of today (23:59:59.999).
 * If `timezoneOffsetMinutes` (e.g. from `new Date().getTimezoneOffset()`) is provided,
 * the boundaries are calculated relative to that local timezone and returned as UTC Dates.
 */
export function getDateBoundaries(
  refDate: Date = new Date(),
  timezoneOffsetMinutes?: number
): DateBoundaries {
  if (typeof timezoneOffsetMinutes === 'number' && !isNaN(timezoneOffsetMinutes)) {
    // Local time = UTC - offset.
    const localTimeMs = refDate.getTime() - timezoneOffsetMinutes * 60 * 1000;
    const localDate = new Date(localTimeMs);

    const localMidnightUtcMs = Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
      0,
      0,
      0,
      0
    );

    const startOfToday = new Date(localMidnightUtcMs + timezoneOffsetMinutes * 60 * 1000);
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

    return { startOfToday, endOfToday };
  }

  const startOfToday = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfToday = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate(),
    23,
    59,
    59,
    999
  );

  return { startOfToday, endOfToday };
}

/**
 * Determines whether a task is overdue:
 * - Has a dueDate
 * - Status is NOT DONE
 * - Due date is strictly before the start of today
 */
export function isTaskOverdue(
  dueDate: Date | string | null | undefined,
  status: TaskStatus | string,
  referenceDateOrBoundaries?: Date | DateBoundaries
): boolean {
  if (!dueDate || status === 'DONE') return false;
  const startOfToday =
    referenceDateOrBoundaries && 'startOfToday' in referenceDateOrBoundaries
      ? referenceDateOrBoundaries.startOfToday
      : getDateBoundaries(referenceDateOrBoundaries as Date | undefined).startOfToday;

  return new Date(dueDate).getTime() < startOfToday.getTime();
}

/**
 * Determines whether a task is due today:
 * - Has a dueDate
 * - Due date falls between startOfToday and endOfToday (inclusive)
 */
export function isTaskToday(
  dueDate: Date | string | null | undefined,
  referenceDateOrBoundaries?: Date | DateBoundaries
): boolean {
  if (!dueDate) return false;
  const boundaries =
    referenceDateOrBoundaries && 'startOfToday' in referenceDateOrBoundaries
      ? (referenceDateOrBoundaries as DateBoundaries)
      : getDateBoundaries(referenceDateOrBoundaries as Date | undefined);

  const due = new Date(dueDate).getTime();
  return due >= boundaries.startOfToday.getTime() && due <= boundaries.endOfToday.getTime();
}

/**
 * Determines whether a task is upcoming:
 * - Has a dueDate
 * - Due date is strictly after endOfToday
 */
export function isTaskUpcoming(
  dueDate: Date | string | null | undefined,
  referenceDateOrBoundaries?: Date | DateBoundaries
): boolean {
  if (!dueDate) return false;
  const endOfToday =
    referenceDateOrBoundaries && 'endOfToday' in referenceDateOrBoundaries
      ? referenceDateOrBoundaries.endOfToday
      : getDateBoundaries(referenceDateOrBoundaries as Date | undefined).endOfToday;

  return new Date(dueDate).getTime() > endOfToday.getTime();
}

export type TaskClassification = 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NO_DUE_DATE';

export function classifyTask(
  task: { dueDate: Date | string | null | undefined; status: TaskStatus | string },
  boundaries: DateBoundaries
): TaskClassification {
  if (!task.dueDate) return 'NO_DUE_DATE';
  if (isTaskOverdue(task.dueDate, task.status, boundaries)) return 'OVERDUE';
  if (isTaskToday(task.dueDate, boundaries)) return 'TODAY';
  if (isTaskUpcoming(task.dueDate, boundaries)) return 'UPCOMING';
  return 'NO_DUE_DATE';
}

/**
 * Builds Prisma where input for date views.
 */
export function buildDateViewFilter(
  view: 'all' | 'today' | 'upcoming' | 'overdue',
  boundaries: DateBoundaries
): Prisma.TaskWhereInput {
  switch (view) {
    case 'overdue':
      return {
        status: { not: 'DONE' },
        dueDate: { lt: boundaries.startOfToday },
      };
    case 'today':
      return {
        dueDate: {
          gte: boundaries.startOfToday,
          lte: boundaries.endOfToday,
        },
      };
    case 'upcoming':
      return {
        dueDate: {
          gt: boundaries.endOfToday,
        },
      };
    case 'all':
    default:
      return {};
  }
}
