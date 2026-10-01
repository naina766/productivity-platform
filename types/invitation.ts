import type { WorkspaceRole } from './project';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface WorkspaceInvitationItem {
  id: string;
  workspaceId: string;
  workspaceName?: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedById: string;
  invitedByName?: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  inviteUrl?: string;
}

export interface CreateInvitationInput {
  email: string;
  role?: WorkspaceRole;
}

export interface PublicInvitationDetails {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  invitedByName: string;
  status: InvitationStatus;
  expiresAt: string;
  isExpired: boolean;
}
