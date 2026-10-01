export type MilestoneStatus = 'OPEN' | 'COMPLETED';

export interface MilestoneItem {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: MilestoneStatus;
  taskCount: number;
  completedTaskCount: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: MilestoneStatus;
}
