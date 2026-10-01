export interface ProjectTaskProgress {
  id: string;
  name: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface WorkspaceAnalytics {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    inReview: number;
    overdue: number;
    completionRate: number;
  };
  priorities: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    onHold: number;
    archived: number;
    progressList: ProjectTaskProgress[];
  };
}
