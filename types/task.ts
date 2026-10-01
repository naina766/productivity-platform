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

export interface SubtaskItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtaskInput {
  title: string;
  isCompleted?: boolean;
}

export interface UpdateSubtaskInput {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

export interface TaskMilestone {
  id: string;
  title: string;
  status: 'OPEN' | 'COMPLETED';
}

import type { RecurrenceInterval } from '@/lib/tasks/recurring';
export type { RecurrenceInterval };

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
  milestoneId?: string | null;
  milestone?: TaskMilestone | null;
  position: number;
  labels: TaskLabel[];
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval | null;
  recurrenceEndDate?: string | null;
  recurringParentId?: string | null;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  subtasks?: SubtaskItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * The task shape the API returns.
 */
export interface TaskDetail extends TaskSummary {
  subtasks?: SubtaskItem[];
}

// MyTaskSummary includes project name for My Tasks view
export interface MyTaskSummary extends TaskSummary {
  projectName: string;
}

export type TaskDateView = 'all' | 'today' | 'upcoming' | 'overdue';

export interface TaskViewCounts {
  all: number;
  today: number;
  upcoming: number;
  overdue: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  milestoneId?: string | null;
  dueDate?: string | null;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval | null;
  recurrenceEndDate?: string | null;
  labelIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  milestoneId?: string | null;
  dueDate?: string | null;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval | null;
  recurrenceEndDate?: string | null;
  position?: number;
  labelIds?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  milestoneId?: string;
  isRecurring?: boolean;
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
