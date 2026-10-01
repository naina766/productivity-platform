import { prisma } from '@/lib/db/prisma';
import { requireWorkspaceMember } from '@/lib/workspaces/permissions';
import type {
  GlobalSearchResults,
  SearchCategory,
  SearchTaskResult,
  SearchProjectResult,
  SearchMilestoneResult,
  SearchMemberResult,
} from '@/types/search';
import type { TaskStatus, TaskPriority } from '@/types/task';
import type { ProjectStatus, ProjectPriority, WorkspaceRole } from '@/types/project';
import type { MilestoneStatus } from '@/types/milestone';

interface SearchOptions {
  workspaceId?: string;
  category?: SearchCategory;
  limit?: number;
}

export async function globalSearch(
  userId: string,
  rawQuery: string,
  options: SearchOptions = {}
): Promise<GlobalSearchResults> {
  const query = rawQuery.trim();
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
  const category = options.category ?? 'all';

  if (!query) {
    return {
      tasks: [],
      projects: [],
      milestones: [],
      members: [],
      totalCount: 0,
    };
  }

  // Resolve target workspace
  let targetWorkspaceId = options.workspaceId;
  if (!targetWorkspaceId) {
    const defaultMembership = await prisma.workspaceMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { workspaceId: true },
    });
    if (!defaultMembership) {
      return { tasks: [], projects: [], milestones: [], members: [], totalCount: 0 };
    }
    targetWorkspaceId = defaultMembership.workspaceId;
  }

  // Confirm authorization to search inside target workspace
  await requireWorkspaceMember(targetWorkspaceId, userId);

  const shouldSearchTasks = category === 'all' || category === 'tasks';
  const shouldSearchProjects = category === 'all' || category === 'projects';
  const shouldSearchMilestones = category === 'all' || category === 'milestones';
  const shouldSearchMembers = category === 'all' || category === 'members';

  const [rawTasks, rawProjects, rawMilestones, rawMembers] = await Promise.all([
    shouldSearchTasks
      ? prisma.task.findMany({
          where: {
            project: { workspaceId: targetWorkspaceId },
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { name: true } },
            milestone: { select: { title: true } },
          },
          take: limit,
          orderBy: { updatedAt: 'desc' },
        })
      : Promise.resolve([]),

    shouldSearchProjects
      ? prisma.project.findMany({
          where: {
            workspaceId: targetWorkspaceId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            _count: { select: { members: true } },
          },
          take: limit,
          orderBy: { updatedAt: 'desc' },
        })
      : Promise.resolve([]),

    shouldSearchMilestones
      ? prisma.milestone.findMany({
          where: {
            project: { workspaceId: targetWorkspaceId },
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            project: { select: { id: true, name: true } },
          },
          take: limit,
          orderBy: { updatedAt: 'desc' },
        })
      : Promise.resolve([]),

    shouldSearchMembers
      ? prisma.workspaceMember.findMany({
          where: {
            workspaceId: targetWorkspaceId,
            user: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          take: limit,
        })
      : Promise.resolve([]),
  ]);

  const tasks: SearchTaskResult[] = rawTasks.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    projectName: t.project.name,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatus,
    priority: t.priority as TaskPriority,
    dueDate: t.dueDate?.toISOString() ?? null,
    milestoneTitle: t.milestone?.title ?? null,
    assigneeName: t.assignee?.name ?? null,
  }));

  const projects: SearchProjectResult[] = rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status as ProjectStatus,
    priority: p.priority as ProjectPriority,
    dueDate: p.dueDate?.toISOString() ?? null,
    memberCount: p._count.members,
  }));

  const milestones: SearchMilestoneResult[] = rawMilestones.map((m) => ({
    id: m.id,
    projectId: m.projectId,
    projectName: m.project.name,
    title: m.title,
    description: m.description,
    status: m.status as MilestoneStatus,
    dueDate: m.dueDate?.toISOString() ?? null,
  }));

  const members: SearchMemberResult[] = rawMembers.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role as WorkspaceRole,
  }));

  const totalCount = tasks.length + projects.length + milestones.length + members.length;

  return {
    tasks,
    projects,
    milestones,
    members,
    totalCount,
  };
}
