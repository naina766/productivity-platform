export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  taskId: string | null;
  projectId: string | null;
  taskTitle: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}