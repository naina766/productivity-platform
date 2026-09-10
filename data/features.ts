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
    description: 'Assign work, leave comments, and mention teammates. Everything stays connected to the right project and task.',
    highlight: 'Inline comments and mentions',
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
    description: 'Follow the latest changes across your workspace — task updates, comments, and new members in one stream.',
    highlight: 'Real-time workspace updates',
  },
  {
    id: 'search-and-filter',
    icon: 'Search',
    title: 'Search & Filter',
    description: 'Find any task, project, or conversation quickly with fast full-text search and status filters.',
    highlight: 'Fast full-text search',
  },
  {
    id: 'notifications',
    icon: 'Zap',
    title: 'Notifications',
    description: 'Get notified when tasks are assigned, commented on, or change status so nothing slips through the cracks.',
    highlight: 'Assignments and mentions',
  },
  {
    id: 'roles-and-permissions',
    icon: 'ShieldCheck',
    title: 'Roles & Permissions',
    description: 'Control what each member can see and do with workspace-level roles, including owners, admins, and members.',
    highlight: '3 workspace-level roles',
  },
];