import type { SolutionItem } from '@/types';

export const solutionsData: SolutionItem[] = [
  {
    id: 'product-teams',
    title: 'Product Teams',
    description: 'Keep features, roadmaps, and delivery progress visible across the team so everyone knows what is next.',
    icon: 'Layers',
    accent: '#22C55E',
    highlights: ['Task boards', 'Progress tracking', 'Team assignments'],
  },
  {
    id: 'engineering-teams',
    title: 'Engineering Teams',
    description: 'Triage bugs, assign work, and track task progress through review and completion without losing context.',
    icon: 'Terminal',
    accent: '#14B8A6',
    highlights: ['Task statuses', 'Activity feed', 'Clear ownership'],
  },
  {
    id: 'startups',
    title: 'Startups',
    description: 'Move from idea to MVP with lightweight project management that keeps every task visible and assigned.',
    icon: 'Rocket',
    accent: '#A3E635',
    highlights: ['Quick setup', 'Simple workflows', 'Clear ownership'],
  },
  {
    id: 'student-teams',
    title: 'Student & Project Teams',
    description: 'Manage group projects, assign roles, and track milestones so every team member knows what they own.',
    icon: 'Users2',
    accent: '#F59E0B',
    highlights: ['Task assignment', 'Progress tracking', 'No setup required'],
  },
  {
    id: 'agencies',
    title: 'Small Agencies',
    description: 'Run multiple client projects in one workspace with separate boards and team members for each engagement.',
    icon: 'Briefcase',
    accent: '#84CC16',
    highlights: ['Multi-project support', 'Team members', 'Clear task ownership'],
  },
  {
    id: 'remote-teams',
    title: 'Remote & Distributed Teams',
    description: 'Keep everyone aligned with an activity feed, task comments, and role-based access so work stays visible regardless of time zone.',
    icon: 'Globe',
    accent: '#34D399',
    highlights: ['Activity feed', 'Comments', 'Roles & permissions'],
  },
];