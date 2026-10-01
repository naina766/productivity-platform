import { prisma } from '@/lib/db/prisma';
import { requireWorkspaceMember } from '@/lib/workspaces/permissions';
import { getDateBoundaries, isTaskOverdue } from '@/lib/tasks/date-utils';
import type { WorkspaceAnalytics, ProjectTaskProgress } from '@/types/analytics';

/**
 * Pure calculation logic from fetched data (enables fast unit testing).
 */
export function calculateWorkspaceAnalytics(
  projects: Array<{ id: string; name: string; status: string }>,
  tasks: Array<{
    id: string;
    projectId: string;
    status: string;
    priority: string;
    dueDate: Date | string | null;
  }>,
  boundaries = getDateBoundaries()
): WorkspaceAnalytics {
  const totalTasks = tasks.length;
  let completed = 0;
  let inProgress = 0;
  let todo = 0;
  let inReview = 0;
  let overdue = 0;

  let urgent = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  const projectTasksMap = new Map<string, { total: number; completed: number }>();
  for (const p of projects) {
    projectTasksMap.set(p.id, { total: 0, completed: 0 });
  }

  for (const t of tasks) {
    // Status
    if (t.status === 'DONE') completed++;
    else if (t.status === 'IN_PROGRESS') inProgress++;
    else if (t.status === 'IN_REVIEW') inReview++;
    else if (t.status === 'TODO') todo++;

    // Overdue
    if (isTaskOverdue(t.dueDate, t.status, boundaries)) {
      overdue++;
    }

    // Priority
    if (t.priority === 'URGENT') urgent++;
    else if (t.priority === 'HIGH') high++;
    else if (t.priority === 'MEDIUM') medium++;
    else if (t.priority === 'LOW') low++;

    // Project progress
    const entry = projectTasksMap.get(t.projectId);
    if (entry) {
      entry.total++;
      if (t.status === 'DONE') {
        entry.completed++;
      }
    }
  }

  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  // Project breakdown
  let active = 0;
  let completedProjects = 0;
  let planning = 0;
  let onHold = 0;
  let archived = 0;

  const progressList: ProjectTaskProgress[] = [];

  for (const p of projects) {
    if (p.status === 'ACTIVE') active++;
    else if (p.status === 'COMPLETED') completedProjects++;
    else if (p.status === 'PLANNING') planning++;
    else if (p.status === 'ON_HOLD') onHold++;
    else if (p.status === 'ARCHIVED') archived++;

    const stats = projectTasksMap.get(p.id) ?? { total: 0, completed: 0 };
    const pRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    progressList.push({
      id: p.id,
      name: p.name,
      status: p.status,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      completionRate: pRate,
    });
  }

  // Sort projects: active first, then highest task count
  progressList.sort((a, b) => b.totalTasks - a.totalTasks);

  return {
    tasks: {
      total: totalTasks,
      completed,
      inProgress,
      todo,
      inReview,
      overdue,
      completionRate,
    },
    priorities: {
      urgent,
      high,
      medium,
      low,
    },
    projects: {
      total: projects.length,
      active,
      completed: completedProjects,
      planning,
      onHold,
      archived,
      progressList,
    },
  };
}

/**
 * Loads analytics for the given workspace, verifying member access.
 */
export async function getWorkspaceAnalytics(
  workspaceId: string,
  userId: string,
  timezoneOffset?: number
): Promise<WorkspaceAnalytics> {
  await requireWorkspaceMember(workspaceId, userId);

  const boundaries = getDateBoundaries(new Date(), timezoneOffset);

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    select: { id: true, name: true, status: true },
  });

  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) {
    return calculateWorkspaceAnalytics([], [], boundaries);
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds } },
    select: {
      id: true,
      projectId: true,
      status: true,
      priority: true,
      dueDate: true,
    },
  });

  return calculateWorkspaceAnalytics(projects, tasks, boundaries);
}
