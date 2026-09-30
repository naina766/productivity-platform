/** API-safe serialised task shapes, not Prisma models. Dates are ISO strings. */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskSummary {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  position: number;
  labels: TaskLabel[];
  createdAt: string;
  updatedAt: string;
}

/**
 * The task shape the API returns. Identical to the summary: the endpoints never
 * expose a separate detail view, so a distinct type would imply fields the
 * server does not send.
 */
export type TaskDetail = TaskSummary;

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  position?: number;
  labelIds?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
}

export type TaskSort = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'position';

/** Runtime lists mirroring the union types, for validating untrusted input. */
export const ALL_TASK_SORTS: TaskSort[] = [
  'createdAt',
  'updatedAt',
  'dueDate',
  'priority',
  'position',
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const ALL_TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export const ALL_TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
