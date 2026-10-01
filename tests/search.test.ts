import { globalSearch } from '../lib/search/search.service';
import { prisma } from '../lib/db/prisma';

// Mock prisma for isolated search unit tests
jest.mock('../lib/db/prisma', () => ({
  prisma: {
    workspaceMember: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
    milestone: {
      findMany: jest.fn(),
    },
  },
}));

describe('Global Search — Unit Tests', () => {
  const userId = 'user-123';
  const workspaceId = 'ws-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty results immediately when query is blank or only whitespace', async () => {
    const res1 = await globalSearch(userId, '');
    expect(res1.totalCount).toBe(0);
    expect(res1.tasks).toEqual([]);
    expect(res1.projects).toEqual([]);
    expect(res1.milestones).toEqual([]);
    expect(res1.members).toEqual([]);

    const res2 = await globalSearch(userId, '     ');
    expect(res2.totalCount).toBe(0);
    expect(prisma.task.findMany).not.toHaveBeenCalled();
  });

  it('verifies workspace membership before executing queries', async () => {
    (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      globalSearch(userId, 'roadmap', { workspaceId: 'forbidden-ws' })
    ).rejects.toThrow();

    expect(prisma.task.findMany).not.toHaveBeenCalled();
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });

  it('searches all categories when category is "all"', async () => {
    (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue({
      id: 'wm-1',
      workspaceId,
      userId,
      role: 'MEMBER',
    });

    (prisma.task.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'task-1',
        projectId: 'p-1',
        title: 'Launch Roadmap',
        description: 'Prepare Q4 roadmap',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date('2026-10-15T00:00:00.000Z'),
        project: { id: 'p-1', name: 'Core Product' },
        assignee: { name: 'Alice' },
        milestone: { title: 'Q4 Launch' },
      },
    ]);

    (prisma.project.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'p-1',
        name: 'Roadmap Planning',
        description: 'Strategic roadmap',
        status: 'ACTIVE',
        priority: 'HIGH',
        dueDate: null,
        _count: { members: 4 },
      },
    ]);

    (prisma.milestone.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'm-1',
        projectId: 'p-1',
        title: 'Roadmap Freeze',
        description: null,
        status: 'OPEN',
        dueDate: null,
        project: { id: 'p-1', name: 'Core Product' },
      },
    ]);

    (prisma.workspaceMember.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'wm-2',
        role: 'ADMIN',
        user: { id: 'u-2', name: 'Bob Roadmap', email: 'bob@example.com' },
      },
    ]);

    const res = await globalSearch(userId, 'Roadmap', { workspaceId });

    expect(res.totalCount).toBe(4);
    expect(res.tasks).toHaveLength(1);
    expect(res.tasks[0].title).toBe('Launch Roadmap');
    expect(res.projects).toHaveLength(1);
    expect(res.projects[0].name).toBe('Roadmap Planning');
    expect(res.milestones).toHaveLength(1);
    expect(res.milestones[0].title).toBe('Roadmap Freeze');
    expect(res.members).toHaveLength(1);
    expect(res.members[0].name).toBe('Bob Roadmap');
  });

  it('only queries tasks when category is "tasks"', async () => {
    (prisma.workspaceMember.findUnique as jest.Mock).mockResolvedValue({
      id: 'wm-1',
      workspaceId,
      userId,
      role: 'MEMBER',
    });

    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

    const res = await globalSearch(userId, 'Deploy', { workspaceId, category: 'tasks' });

    expect(res.totalCount).toBe(0);
    expect(prisma.task.findMany).toHaveBeenCalled();
    expect(prisma.project.findMany).not.toHaveBeenCalled();
    expect(prisma.milestone.findMany).not.toHaveBeenCalled();
    expect(prisma.workspaceMember.findMany).not.toHaveBeenCalled();
  });
});
