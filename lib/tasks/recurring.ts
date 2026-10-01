export type RecurrenceInterval = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';

export const RECURRENCE_INTERVALS: RecurrenceInterval[] = [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'YEARLY',
];

export const RECURRENCE_LABELS: Record<RecurrenceInterval, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Every 2 weeks',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

/**
 * Calculates the next occurrence date for a recurring task.
 *
 * If the current due date is in the past, it advances the date until the next
 * occurrence is strictly after `afterDate` (defaults to current time).
 */
export function calculateNextOccurrence(
  baseDueDate: Date | string | null,
  interval: RecurrenceInterval,
  afterDate: Date = new Date()
): Date {
  const current = baseDueDate ? new Date(baseDueDate) : new Date(afterDate);
  const next = new Date(current);

  const stepForward = (d: Date): void => {
    switch (interval) {
      case 'DAILY':
        d.setUTCDate(d.getUTCDate() + 1);
        break;
      case 'WEEKLY':
        d.setUTCDate(d.getUTCDate() + 7);
        break;
      case 'BIWEEKLY':
        d.setUTCDate(d.getUTCDate() + 14);
        break;
      case 'MONTHLY': {
        const expectedDay = d.getUTCDate();
        d.setUTCMonth(d.getUTCMonth() + 1);
        // If month had fewer days (e.g. Jan 31 -> Mar 2), clamp to last day of target month
        if (d.getUTCDate() !== expectedDay) {
          d.setUTCDate(0);
        }
        break;
      }
      case 'YEARLY':
        d.setUTCFullYear(d.getUTCFullYear() + 1);
        break;
    }
  };

  stepForward(next);

  // If the calculated next date is still in the past or equal to afterDate,
  // continue advancing until the occurrence is in the future.
  const targetTime = afterDate.getTime();
  let guard = 0;
  while (next.getTime() <= targetTime && guard < 500) {
    stepForward(next);
    guard++;
  }

  return next;
}

/**
 * Verifies whether the next recurrence should spawn given the optional end date.
 */
export function shouldSpawnNextOccurrence(
  nextDueDate: Date,
  recurrenceEndDate: Date | string | null
): boolean {
  if (!recurrenceEndDate) return true;
  const endDate = new Date(recurrenceEndDate);
  return nextDueDate.getTime() <= endDate.getTime();
}
