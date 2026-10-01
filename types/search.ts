import type { TaskStatus, TaskPriority } from './task';
import type { ProjectStatus, ProjectPriority, WorkspaceRole } from './project';
import type { MilestoneStatus } from './milestone';

export type SearchCategory = 'all' | 'tasks' | 'projects' | 'milestones' | 'members';

export interface SearchTaskResult {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  milestoneTitle: string | null;
  assigneeName: string | null;
}

export interface SearchProjectResult {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string | null;
  memberCount: number;
}

export interface SearchMilestoneResult {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: string | null;
}

export interface SearchMemberResult {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
}

export interface GlobalSearchResults {
  tasks: SearchTaskResult[];
  projects: SearchProjectResult[];
  milestones: SearchMilestoneResult[];
  members: SearchMemberResult[];
  totalCount: number;
}
