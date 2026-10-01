import { calculateWorkspaceAnalytics } from '../lib/workspaces/analytics.service';

describe('Workspace Analytics Service', () => {
  const boundaries = {
    startOfToday: new Date('2026-10-01T00:00:00.000Z'),
    endOfToday: new Date('2026-10-01T23:59:59.999Z'),
  };

  it('handles empty workspace with zero tasks and zero projects', () => {
    const analytics = calculateWorkspaceAnalytics([], [], boundaries);

    expect(analytics.tasks.total).toBe(0);
    expect(analytics.tasks.completed).toBe(0);
    expect(analytics.tasks.completionRate).toBe(0);
    expect(analytics.tasks.overdue).toBe(0);
    expect(analytics.projects.total).toBe(0);
    expect(analytics.projects.progressList).toEqual([]);
  });

  it('correctly calculates status, priority, overdue, and project progress metrics', () => {
    const sampleProjects = [
      { id: 'p1', name: 'Frontend App', status: 'ACTIVE' },
      { id: 'p2', name: 'API Server', status: 'PLANNING' },
    ];

    const sampleTasks = [
      // p1 tasks
      {
        id: 't1',
        projectId: 'p1',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: '2026-09-25T00:00:00.000Z', // Past, but DONE so not overdue
      },
      {
        id: 't2',
        projectId: 'p1',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: '2026-09-28T00:00:00.000Z', // Past and NOT done -> Overdue!
      },
      {
        id: 't3',
        projectId: 'p1',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '2026-10-01T15:00:00.000Z', // Today
      },
      {
        id: 't4',
        projectId: 'p1',
        status: 'IN_REVIEW',
        priority: 'LOW',
        dueDate: '2026-10-10T00:00:00.000Z', // Upcoming
      },
      // p2 tasks
      {
        id: 't5',
        projectId: 'p2',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: '2026-10-05T00:00:00.000Z',
      },
    ];

    const analytics = calculateWorkspaceAnalytics(sampleProjects, sampleTasks, boundaries);

    // Tasks metrics
    expect(analytics.tasks.total).toBe(5);
    expect(analytics.tasks.completed).toBe(2);
    expect(analytics.tasks.inProgress).toBe(1);
    expect(analytics.tasks.inReview).toBe(1);
    expect(analytics.tasks.todo).toBe(1);
    expect(analytics.tasks.overdue).toBe(1); // t2 only
    expect(analytics.tasks.completionRate).toBe(40); // 2/5 = 40%

    // Priorities
    expect(analytics.priorities.urgent).toBe(1);
    expect(analytics.priorities.high).toBe(2);
    expect(analytics.priorities.medium).toBe(1);
    expect(analytics.priorities.low).toBe(1);

    // Projects metrics
    expect(analytics.projects.total).toBe(2);
    expect(analytics.projects.active).toBe(1);
    expect(analytics.projects.planning).toBe(1);

    // Project progress
    const p1Progress = analytics.projects.progressList.find((p) => p.id === 'p1');
    expect(p1Progress).toBeDefined();
    expect(p1Progress?.totalTasks).toBe(4);
    expect(p1Progress?.completedTasks).toBe(1);
    expect(p1Progress?.completionRate).toBe(25);

    const p2Progress = analytics.projects.progressList.find((p) => p.id === 'p2');
    expect(p2Progress).toBeDefined();
    expect(p2Progress?.totalTasks).toBe(1);
    expect(p2Progress?.completedTasks).toBe(1);
    expect(p2Progress?.completionRate).toBe(100);
  });
});
