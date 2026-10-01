/**
 * Pure calculation utilities for project task progress.
 */

export interface ProjectTaskStats {
  total: number;
  completed: number;
  inProgress: number;
  inReview: number;
  todo: number;
  completionRate: number;
}

export function calculateProjectTaskStats(
  tasks: Array<{ status: string }> = []
): ProjectTaskStats {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      inReview: 0,
      todo: 0,
      completionRate: 0,
    };
  }

  let completed = 0;
  let inProgress = 0;
  let inReview = 0;
  let todo = 0;

  for (const task of tasks) {
    switch (task.status) {
      case 'DONE':
        completed++;
        break;
      case 'IN_PROGRESS':
        inProgress++;
        break;
      case 'IN_REVIEW':
        inReview++;
        break;
      case 'TODO':
      default:
        todo++;
        break;
    }
  }

  const completionRate = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    inProgress,
    inReview,
    todo,
    completionRate,
  };
}
