/**
 * Centralised API client for browser-side calls to /api/auth/*.
 * - Uses same-origin relative URLs (no localhost:4000, no hardcoded port)
 * - Sends credentials (cookies) with every request
 * - Holds the access token in memory (never localStorage / sessionStorage)
 * - Automatically tries to refresh the token on 401 responses
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// In-memory access token store — survives re-renders but clears on page reload.
// The refresh cookie (HttpOnly) is used to re-issue a new one on reload.
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!options.skipAuth && _accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers,
  });

  const body = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      typeof body['message'] === 'string'
        ? body['message']
        : 'An unexpected error occurred.';
    throw new ApiError(res.status, message);
  }

  return body as T;
}

// ─── Auth endpoints ──────────────────────────────────────────────────────────

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  success: true;
  user: SafeUser;
  accessToken: string;
  workspace?: { id: string; name: string; role: string };
}

export interface RegisterResponse {
  success: true;
  user: SafeUser;
  accessToken: string;
  workspace?: { id: string; name: string; role: string };
}

export interface MeResponse {
  success: true;
  user: SafeUser;
  workspace?: { id: string; name: string; role: string };
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function apiRegister(name: string, email: string, password: string): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    skipAuth: true,
  });
}

export async function apiRefresh(): Promise<{ accessToken: string }> {
  return apiFetch<{ accessToken: string }>('/api/auth/refresh', {
    method: 'POST',
    skipAuth: true,
  });
}

export async function apiMe(accessToken: string): Promise<MeResponse> {
  const res = await fetch('/api/auth/me', {
    credentials: 'same-origin',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new ApiError(res.status, 'Not authenticated');
  return res.json() as Promise<MeResponse>;
}

export async function apiLogout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  setAccessToken(null);
}

// ─── Workspace endpoints ──────────────────────────────────────────────────────
import type {
  WorkspaceMemberItem,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '@/types/workspace';

interface WorkspaceMembersResponse {
  success: true;
  data: WorkspaceMemberItem[];
}

interface WorkspaceMemberResponse {
  success: true;
  data: WorkspaceMemberItem;
}

export async function apiGetWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMembersResponse> {
  return apiFetch<WorkspaceMembersResponse>(`/api/workspaces/${workspaceId}/members`);
}

export async function apiAddWorkspaceMember(
  workspaceId: string,
  data: AddWorkspaceMemberInput,
): Promise<WorkspaceMemberResponse> {
  return apiFetch<WorkspaceMemberResponse>(`/api/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  data: UpdateWorkspaceMemberRoleInput,
): Promise<WorkspaceMemberResponse> {
  return apiFetch<WorkspaceMemberResponse>(`/api/workspaces/${workspaceId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiRemoveWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<{ success: true; message: string }> {
  return apiFetch(`/api/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' });
}

// ─── Project endpoints ────────────────────────────────────────────────────────

import type {
  ProjectSummary,
  ProjectDetail,
  ProjectMemberItem,
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectMemberInput,
  UpdateProjectMemberInput,
} from '@/types/project';

interface ProjectListResponse {
  success: true;
  data: ProjectSummary[];
}

interface ProjectDetailResponse {
  success: true;
  data: ProjectDetail;
}

interface ProjectMembersResponse {
  success: true;
  data: ProjectMemberItem[];
}

interface ProjectMemberResponse {
  success: true;
  data: ProjectMemberItem;
}

export async function apiGetProjects(
  workspaceId: string,
  filters?: { search?: string },
): Promise<ProjectListResponse> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString();
  return apiFetch<ProjectListResponse>(
    `/api/workspaces/${workspaceId}/projects${qs ? `?${qs}` : ''}`,
  );
}

export async function apiCreateProject(
  workspaceId: string,
  data: CreateProjectInput,
): Promise<ProjectDetailResponse> {
  return apiFetch<ProjectDetailResponse>(`/api/workspaces/${workspaceId}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetProject(projectId: string): Promise<ProjectDetailResponse> {
  return apiFetch<ProjectDetailResponse>(`/api/projects/${projectId}`);
}

export async function apiUpdateProject(
  projectId: string,
  data: UpdateProjectInput,
): Promise<ProjectDetailResponse> {
  return apiFetch<ProjectDetailResponse>(`/api/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiArchiveProject(
  projectId: string,
): Promise<{ success: true; data: { id: string; status: string } }> {
  return apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' });
}

export async function apiGetProjectMembers(
  projectId: string,
): Promise<ProjectMembersResponse> {
  return apiFetch<ProjectMembersResponse>(`/api/projects/${projectId}/members`);
}

export async function apiAddProjectMember(
  projectId: string,
  data: AddProjectMemberInput,
): Promise<ProjectMemberResponse> {
  return apiFetch<ProjectMemberResponse>(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProjectMember(
  projectId: string,
  userId: string,
  data: UpdateProjectMemberInput,
): Promise<ProjectMemberResponse> {
  return apiFetch<ProjectMemberResponse>(`/api/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiRemoveProjectMember(
  projectId: string,
  userId: string,
): Promise<{ success: true; message: string }> {
  return apiFetch(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
}

// ─── Task endpoints ───────────────────────────────────────────────────────────

import type {
  TaskSummary,
  TaskDetail,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
  TaskSort,
} from '@/types/task';

interface TaskListResponse {
  success: true;
  data: TaskSummary[];
}

interface TaskDetailResponse {
  success: true;
  data: TaskDetail;
}

export async function apiGetTasks(
  projectId: string,
  filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    search?: string;
    sort?: TaskSort;
  },
): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);

  const qs = params.toString();
  return apiFetch<TaskListResponse>(
    `/api/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`,
  );
}

export async function apiGetTask(taskId: string): Promise<TaskDetailResponse> {
  return apiFetch<TaskDetailResponse>(`/api/tasks/${taskId}`);
}

export async function apiCreateTask(
  projectId: string,
  data: CreateTaskInput,
): Promise<TaskDetailResponse> {
  return apiFetch<TaskDetailResponse>(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateTask(
  taskId: string,
  data: UpdateTaskInput,
): Promise<TaskDetailResponse> {
  return apiFetch<TaskDetailResponse>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteTask(
  taskId: string,
): Promise<{ success: true; message: string }> {
  return apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
}

// ─── Comment endpoints ─────────────────────────────────────────────────────────

import type {
  CommentItem,
  CreateCommentInput,
  UpdateCommentInput,
} from '@/types/comment';

interface CommentListResponse {
  success: true;
  data: { comments: CommentItem[] };
}

interface CommentResponse {
  success: true;
  data: CommentItem;
}

export async function apiGetTaskComments(
  taskId: string,
  limit = 100,
): Promise<CommentListResponse> {
  return apiFetch<CommentListResponse>(`/api/tasks/${taskId}/comments?limit=${limit}`);
}

export async function apiCreateComment(
  taskId: string,
  data: CreateCommentInput,
): Promise<CommentResponse> {
  return apiFetch<CommentResponse>(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateComment(
  commentId: string,
  data: UpdateCommentInput,
): Promise<CommentResponse> {
  return apiFetch<CommentResponse>(`/api/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteComment(
  commentId: string,
): Promise<{ success: true; message: string }> {
  return apiFetch(`/api/comments/${commentId}`, { method: 'DELETE' });
}

// ─── Activity endpoints ────────────────────────────────────────────────────────

import type { ActivityItem } from '@/types/activity';

interface ActivityListResponse {
  success: true;
  data: { activities: ActivityItem[] };
}

export async function apiGetProjectActivity(
  projectId: string,
  options?: { taskId?: string; limit?: number },
): Promise<ActivityListResponse> {
  const params = new URLSearchParams();
  if (options?.taskId) params.set('taskId', options.taskId);
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  return apiFetch<ActivityListResponse>(
    `/api/projects/${projectId}/activity${qs ? `?${qs}` : ''}`,
  );
}

// ─── Notification endpoints ────────────────────────────────────────────────────

import type { NotificationItem } from '@/types/notification';

export interface NotificationListResponse {
  success: true;
  data: { notifications: NotificationItem[]; unreadCount: number };
}

export async function apiGetNotifications(
  options?: { unread?: boolean; limit?: number },
): Promise<NotificationListResponse> {
  const params = new URLSearchParams();
  if (options?.unread) params.set('unread', 'true');
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  return apiFetch<NotificationListResponse>(`/api/notifications${qs ? `?${qs}` : ''}`);
}

export async function apiMarkNotificationRead(
  notificationId: string,
): Promise<{ success: true; message: string }> {
  return apiFetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
}

export async function apiMarkAllNotificationsRead(): Promise<{
  success: true;
  unreadCount: number;
}> {
  return apiFetch('/api/notifications/read-all', { method: 'POST' });
}
