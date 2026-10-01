import { calculateProjectTaskStats } from '../lib/projects/project-progress';

describe('Project Progress Calculation Utility', () => {
  it('returns zeros when task list is empty', () => {
    const stats = calculateProjectTaskStats([]);
    expect(stats).toEqual({
      total: 0,
      completed: 0,
      inProgress: 0,
      inReview: 0,
      todo: 0,
      completionRate: 0,
    });
  });

  it('correctly tallies task statuses and calculates completion percentage', () => {
    const tasks = [
      { status: 'DONE' },
      { status: 'DONE' },
      { status: 'IN_PROGRESS' },
      { status: 'IN_REVIEW' },
      { status: 'TODO' },
    ];

    const stats = calculateProjectTaskStats(tasks);
    expect(stats.total).toBe(5);
    expect(stats.completed).toBe(2);
    expect(stats.inProgress).toBe(1);
    expect(stats.inReview).toBe(1);
    expect(stats.todo).toBe(1);
    expect(stats.completionRate).toBe(40);
  });

  it('handles 100% completion correctly', () => {
    const tasks = [{ status: 'DONE' }, { status: 'DONE' }, { status: 'DONE' }];
    const stats = calculateProjectTaskStats(tasks);
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(3);
    expect(stats.completionRate).toBe(100);
  });

  it('rounds percentage appropriately', () => {
    // 1 out of 3 = 33.333% -> 33%
    const tasks = [{ status: 'DONE' }, { status: 'TODO' }, { status: 'TODO' }];
    const stats = calculateProjectTaskStats(tasks);
    expect(stats.completionRate).toBe(33);

    // 2 out of 3 = 66.666% -> 67%
    const tasks2 = [{ status: 'DONE' }, { status: 'DONE' }, { status: 'TODO' }];
    const stats2 = calculateProjectTaskStats(tasks2);
    expect(stats2.completionRate).toBe(67);
  });
});
