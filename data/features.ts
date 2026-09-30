import type { Feature } from '@/types';

export const featuresData: Feature[] = [
  {
    id: 'project-workspaces',
    icon: 'Layers',
    title: 'Project Workspaces',
    description: 'Group projects, tasks, and members into dedicated workspaces. Keep every team working independently with clear structure.',
    highlight: 'Multiple projects per workspace',
  },
  {
    id: 'task-management',
    icon: 'CheckSquare2',
    title: 'Task Management',
    description: 'Track every task across four clear states — to do, in progress, in review, and done. Assign owners and set due dates.',
    badge: 'Core',
    highlight: '4 task status states',
  },
  {
    id: 'team-collaboration',
    icon: 'Users',
    title: 'Team Collaboration',
    description: 'Assign work and discuss it in context. Every comment stays attached to the task it belongs to.',
    highlight: 'Comments on every task',
  },
  {
    id: 'progress-tracking',
    icon: 'BarChart3',
    title: 'Progress Tracking',
    description: 'See project completion and task status at a glance with clear visual progress indicators on every board.',
    highlight: 'Visual progress on every board',
  },
  {
    id: 'activity-feed',
    icon: 'Radio',
    title: 'Activity Feed',
    description: 'Review who changed what across a project — task updates, comments, and membership changes in one timeline.',
    highlight: 'Per-project audit trail',
  },
  {
    id: 'search-and-filter',
    icon: 'Search',
    title: 'Search & Filter',
    description: 'Narrow a project down by keyword, status, priority, or assignee to find the work you care about.',
    highlight: 'Search and filter by status or assignee',
  },
  {
    id: 'notifications',
    icon: 'Zap',
    title: 'Notifications',
    description: 'Get notified when a task is assigned to you, commented on, or marked done so nothing slips through the cracks.',
    highlight: 'In-app notification feed',
  },
  {
    id: 'roles-and-permissions',
    icon: 'ShieldCheck',
    title: 'Roles & Permissions',
    description: 'Control what each member can see and do with workspace-level roles, including owners, admins, and members.',
    highlight: '3 workspace-level roles',
  },
];