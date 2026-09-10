/**
 * NOVA — Workspace member types.
 * API-safe serialised shapes, not Prisma models.
 * Dates are ISO strings; no internal DB fields exposed.
 */

import type { WorkspaceRole } from '@/types/project';

export interface WorkspaceMemberUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface WorkspaceMemberItem {
  id: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  user: WorkspaceMemberUser;
}

export interface AddWorkspaceMemberInput {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateWorkspaceMemberRoleInput {
  role: WorkspaceRole;
}

export interface WorkspaceMembersResponse {
  success: true;
  data: WorkspaceMemberItem[];
}

export interface WorkspaceMemberResponse {
  success: true;
  data: WorkspaceMemberItem;
}
