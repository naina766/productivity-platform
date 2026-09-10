import type { TaskAssignee } from '@/types/task';

export const ACTIVITY_TYPES = [
  'PROJECT_CREATED',
  'TASK_CREATED',
  'TASK_ASSIGNED',
  'TASK_STATUS_CHANGED',
  'TASK_COMPLETED',
  'COMMENT_ADDED',
  'MEMBER_ADDED',
  'MEMBER_REMOVED',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  metadata: Record<string, unknown> | null;
  actor: TaskAssignee | null;
  taskId?: string | null;
  taskTitle?: string | null;
  createdAt: string;
}

export interface ActivityListResponse {
  activities: ActivityItem[];
}