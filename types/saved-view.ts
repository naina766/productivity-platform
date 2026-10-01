import type { TaskStatus, TaskPriority } from './task';

export interface SavedViewFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  milestoneId?: string;
  search?: string;
  hasDueDate?: boolean;
  isRecurring?: boolean;
}

export interface SavedView {
  id: string;
  workspaceId: string;
  projectId: string | null;
  userId: string;
  name: string;
  filters: SavedViewFilters;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc' | null;
  viewType: 'list' | 'board' | 'calendar';
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface CreateSavedViewInput {
  name: string;
  projectId?: string | null;
  filters: SavedViewFilters;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
  viewType?: 'list' | 'board' | 'calendar';
  isShared?: boolean;
}

export interface UpdateSavedViewInput {
  name?: string;
  filters?: SavedViewFilters;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
  viewType?: 'list' | 'board' | 'calendar';
  isShared?: boolean;
}
