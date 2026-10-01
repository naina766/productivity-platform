export type RealtimeEventType =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'COMMENT_CREATED'
  | 'COMMENT_DELETED'
  | 'NOTIFICATION_CREATED'
  | 'PROJECT_UPDATED'
  | 'HEARTBEAT';

export interface RealtimeEvent<T = unknown> {
  id: string;
  type: RealtimeEventType;
  workspaceId: string;
  projectId?: string;
  actorId?: string;
  data: T;
  timestamp: string;
}
