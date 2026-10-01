import { getErrorMessage } from '@/lib/errors';
import type { ApiUser, ApiWorkspace } from '@/types/auth';
import type {
  WorkspaceMemberItem,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '@/types/workspace';
import type {
  ProjectSummary,
  ProjectDetail,
  ProjectMemberItem,
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectMemberInput,
  UpdateProjectMemberInput,
} from '@/types/project';
import type {
  TaskSummary,
  TaskDetail,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
  TaskSort,
  SubtaskItem,
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from '@/types/task';
import type { CommentItem, CreateCommentInput, UpdateCommentInput } from '@/types/comment';
import type { ActivityItem } from '@/types/activity';
import type { NotificationItem } from '@/types/notification';

import type { MyTaskSummary, TaskDateView, TaskViewCounts } from '@/types/task';
import type { WorkspaceAnalytics } from '@/types/analytics';
import type { MilestoneItem, CreateMilestoneInput, UpdateMilestoneInput } from '@/types/milestone';
/**
 * Browser-side API client.
 *
 * - Same-origin relative URLs, so there is no hardcoded host or port
 * - Sends cookies with every request; the refresh cookie is HttpOnly
 * - Holds the access token in memory only, never localStorage or sessionStorage
 * - Refreshes once on a 401, then retries the original request
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Envelope shapes shared by every endpoint. */
interface ItemResponse<T> {
  success: true;
  data: T;
}

export interface ListResponse<T> {
  success: true;
  data: T[];
}

interface MessageResponse {
  success: true;
  message: string;
}

interface AuthResponse {
  success: true;
  user: ApiUser;
  accessToken: string;
  workspace?: ApiWorkspace;
}

interface MeResponse {
  success: true;
  user: ApiUser;
  workspace?: ApiWorkspace;
}

// In-memory access token store. It survives re-renders but is lost on reload,
// which is safe: the HttpOnly refresh cookie is used to mint a new one.
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

type AuthFailureCallback = () => void;
const authFailureCallbacks = new Set<AuthFailureCallback>();

/** Subscribe to session loss. Returns an unsubscribe function. */
export function onAuthFailure(callback: AuthFailureCallback): () => void {
  authFailureCallbacks.add(callback);
  return () => {
    authFailureCallbacks.delete(callback);
  };
}

export function notifyAuthFailure(): void {
  for (const cb of authFailureCallbacks) {
    try {
      cb();
    } catch {
      // A misbehaving listener must not block the others.
    }
  }
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

function readMessage(body: Record<string, unknown>, fallback: string): string {
  return typeof body.message === 'string' ? body.message : fallback;
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  /** Guards against an infinite 401 → refresh → 401 loop. */
  retried?: boolean;
}

/**
 * Exchange the refresh cookie for a new access token.
 *
 * Concurrent callers share one in-flight promise, so a burst of parallel 401s
 * triggers a single rotation rather than one per request.
 */
async function requestRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'same-origin',
        });

        const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const token = body.accessToken;

        if (!res.ok || typeof token !== 'string') {
          throw new ApiError(res.status || 401, readMessage(body, 'Session refresh failed.'));
        }

        setAccessToken(token);
        return token;
      } catch (err) {
        setAccessToken(null);
        notifyAuthFailure();
        throw err instanceof ApiError ? err : new ApiError(0, getErrorMessage(err));
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, retried, headers: callerHeaders, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(callerHeaders as Record<string, string> | undefined),
  };
  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(path, { ...init, credentials: 'same-origin', headers });
  } catch (err) {
    // status 0 marks a transport failure, which no HTTP status can produce.
    throw new ApiError(0, getErrorMessage(err));
  }

  // Never refresh in response to an auth route failing: that would recurse
  // into the very endpoint that just failed.
  const isAuthRoute = path.startsWith('/api/auth/');

  if (res.status === 401 && !skipAuth && !isAuthRoute && !retried) {
    try {
      const newToken = await requestRefresh();
      return await apiFetch<T>(path, { ...options, retried: true, headers: { ...callerHeaders, Authorization: `Bearer ${newToken}` } });
    } catch {
      // Refresh failed; the access token is already cleared and listeners notified.
    }
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    if (res.status === 401 && !isAuthRoute) {
      setAccessToken(null);
      notifyAuthFailure();
    }
    throw new ApiError(res.status, readMessage(body, 'An unexpected error occurred.'));
  }

  return body as T;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    skipAuth: true,
  });
}

export async function apiRefresh(): Promise<{ accessToken: string }> {
  return { accessToken: await requestRefresh() };
}

export async function apiMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/auth/me');
}

export async function apiLogout(): Promise<void> {
  try {
    await apiFetch<MessageResponse>('/api/auth/logout', { method: 'POST' });
  } finally {
    // The local session is dropped whether or not the server call succeeded.
    setAccessToken(null);
    notifyAuthFailure();
  }
}

export async function apiGetWorkspaceMembers(
  workspaceId: string,
): Promise<ListResponse<WorkspaceMemberItem>> {
  return apiFetch(`/api/workspaces/${workspaceId}/members`);
}

export async function apiAddWorkspaceMember(
  workspaceId: string,
  data: AddWorkspaceMemberInput,
): Promise<ItemResponse<WorkspaceMemberItem>> {
  return apiFetch(`/api/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  data: UpdateWorkspaceMemberRoleInput,
): Promise<ItemResponse<WorkspaceMemberItem>> {
  return apiFetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiRemoveWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<MessageResponse> {
  return apiFetch(`/api/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' });
}

export async function apiGetProjects(
  workspaceId: string,
  filters?: { search?: string },
): Promise<ListResponse<ProjectSummary>> {
  return apiFetch(`/api/workspaces/${workspaceId}/projects${buildQuery({ search: filters?.search })}`);
}

export async function apiCreateProject(
  workspaceId: string,
  data: CreateProjectInput,
): Promise<ItemResponse<ProjectDetail>> {
  return apiFetch(`/api/workspaces/${workspaceId}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetProject(projectId: string): Promise<ItemResponse<ProjectDetail>> {
  return apiFetch(`/api/projects/${projectId}`);
}

export async function apiUpdateProject(
  projectId: string,
  data: UpdateProjectInput,
): Promise<ItemResponse<ProjectDetail>> {
  return apiFetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiArchiveProject(
  projectId: string,
): Promise<ItemResponse<{ id: string; status: string }>> {
  return apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' });
}

export async function apiGetProjectMembers(
  projectId: string,
): Promise<ListResponse<ProjectMemberItem>> {
  return apiFetch(`/api/projects/${projectId}/members`);
}

export async function apiAddProjectMember(
  projectId: string,
  data: AddProjectMemberInput,
): Promise<ItemResponse<ProjectMemberItem>> {
  return apiFetch(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProjectMember(
  projectId: string,
  userId: string,
  data: UpdateProjectMemberInput,
): Promise<ItemResponse<ProjectMemberItem>> {
  return apiFetch(`/api/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiRemoveProjectMember(
  projectId: string,
  userId: string,
): Promise<MessageResponse> {
  return apiFetch(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
}

export async function apiGetTasks(
  projectId: string,
  filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    milestoneId?: string;
    isRecurring?: boolean;
    search?: string;
    sort?: TaskSort;
  },
): Promise<ListResponse<TaskSummary>> {
  return apiFetch(`/api/projects/${projectId}/tasks${buildQuery({ ...filters })}`);
}

export async function apiGetTask(taskId: string): Promise<ItemResponse<TaskDetail>> {
  return apiFetch(`/api/tasks/${taskId}`);
}

export async function apiCreateTask(
  projectId: string,
  data: CreateTaskInput,
): Promise<ItemResponse<TaskDetail>> {
  return apiFetch(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateTask(
  taskId: string,
  data: UpdateTaskInput,
): Promise<ItemResponse<TaskDetail>> {
  return apiFetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteTask(taskId: string): Promise<MessageResponse> {
  return apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
}

export async function apiGetSubtasks(
  taskId: string
): Promise<ItemResponse<{ subtasks: SubtaskItem[] }>> {
  return apiFetch(`/api/tasks/${taskId}/subtasks`);
}

export async function apiCreateSubtask(
  taskId: string,
  data: CreateSubtaskInput
): Promise<ItemResponse<SubtaskItem>> {
  return apiFetch(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateSubtask(
  subtaskId: string,
  data: UpdateSubtaskInput
): Promise<ItemResponse<SubtaskItem>> {
  return apiFetch(`/api/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteSubtask(
  subtaskId: string
): Promise<MessageResponse> {
  return apiFetch(`/api/subtasks/${subtaskId}`, {
    method: 'DELETE',
  });
}

export async function apiGetProjectMilestones(
  projectId: string
): Promise<ItemResponse<{ milestones: MilestoneItem[] }>> {
  return apiFetch(`/api/projects/${projectId}/milestones`);
}

export async function apiCreateMilestone(
  projectId: string,
  data: CreateMilestoneInput
): Promise<ItemResponse<MilestoneItem>> {
  return apiFetch(`/api/projects/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateMilestone(
  milestoneId: string,
  data: UpdateMilestoneInput
): Promise<ItemResponse<MilestoneItem>> {
  return apiFetch(`/api/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteMilestone(
  milestoneId: string
): Promise<MessageResponse> {
  return apiFetch(`/api/milestones/${milestoneId}`, {
    method: 'DELETE',
  });
}

export async function apiGetTaskComments(
  taskId: string,
  limit = 100,
): Promise<ItemResponse<{ comments: CommentItem[] }>> {
  return apiFetch(`/api/tasks/${taskId}/comments${buildQuery({ limit })}`);
}

export async function apiCreateComment(
  taskId: string,
  data: CreateCommentInput,
): Promise<ItemResponse<CommentItem>> {
  return apiFetch(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateComment(
  commentId: string,
  data: UpdateCommentInput,
): Promise<ItemResponse<CommentItem>> {
  return apiFetch(`/api/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteComment(commentId: string): Promise<MessageResponse> {
  return apiFetch(`/api/comments/${commentId}`, { method: 'DELETE' });
}

export async function apiGetProjectActivity(
  projectId: string,
  options?: { taskId?: string; limit?: number },
): Promise<ItemResponse<{ activities: ActivityItem[] }>> {
  return apiFetch(`/api/projects/${projectId}/activity${buildQuery({ ...options })}`);
}

export async function apiGetNotifications(
  options?: { unread?: boolean; limit?: number },
): Promise<ItemResponse<{ notifications: NotificationItem[]; unreadCount: number }>> {
  return apiFetch(`/api/notifications${buildQuery({ ...options })}`);
}

export async function apiMarkNotificationRead(notificationId: string): Promise<MessageResponse> {
  return apiFetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
}

export async function apiMarkAllNotificationsRead(): Promise<
  ItemResponse<{ unreadCount: number }>
> {
  return apiFetch('/api/notifications/read-all', { method: 'POST' });
}
export interface MyTasksResponse {
  success: true;
  data: MyTaskSummary[];
  counts: TaskViewCounts;
}

export async function apiGetMyTasks(filters?: {
  view?: TaskDateView;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  search?: string;
  timezoneOffset?: number;
}): Promise<MyTasksResponse> {
  return apiFetch(`/api/my-tasks${buildQuery({ ...filters })}`);
}

export async function apiGetCalendarTasks(filters?: {
  start?: string;
  end?: string;
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}): Promise<ListResponse<MyTaskSummary>> {
  return apiFetch(`/api/calendar${buildQuery({ ...filters })}`);
}

export async function apiGetWorkspaceAnalytics(
  workspaceId: string,
  timezoneOffset?: number
): Promise<ItemResponse<WorkspaceAnalytics>> {
  return apiFetch(`/api/workspaces/${workspaceId}/analytics${buildQuery({ timezoneOffset })}`);
}
