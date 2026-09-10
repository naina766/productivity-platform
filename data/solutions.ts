import type { SolutionItem } from '@/types';

export const solutionsData: SolutionItem[] = [
  {
    id: 'product-teams',
    title: 'Product Teams',
    description: 'Connect customer feedback, feature roadmaps, and delivery milestones. Track release progress from planning to launch.',
    icon: 'Layers',
    accent: '#22C55E',
    highlights: ['Roadmap tracking', 'Feature prioritization', 'Release notes'],
  },
  {
    id: 'engineering-teams',
    title: 'Engineering Teams',
    description: 'Manage sprints, triage bugs, and connect pull requests to project requirements without switching tools.',
    icon: 'Terminal',
    accent: '#14B8A6',
    highlights: ['Sprint planning', 'Velocity tracking', 'PR linking'],
  },
  {
    id: 'marketing-teams',
    title: 'Marketing Teams',
    description: 'Coordinate campaigns, track content deadlines, and ensure launches stay on schedule.',
    icon: 'Megaphone',
    accent: '#84CC16',
    highlights: ['Content calendar', 'Asset tracking', 'Campaign timelines'],
  },
  {
    id: 'startups',
    title: 'Startups',
    description: 'Move fast from idea to shipping. Stay focused on MVP goals with lightweight project management.',
    icon: 'Rocket',
    accent: '#A3E635',
    highlights: ['Quick setup', 'Agile templates', 'Zero maintenance'],
  },
  {
    id: 'agencies',
    title: 'Agencies & Consultancies',
    description: 'Manage multiple client projects, track billable milestones, and share status reports with granular access controls.',
    icon: 'Briefcase',
    accent: '#F59E0B',
    highlights: ['Client views', 'Multi-project', 'Budget tracking'],
  },
  {
    id: 'remote-teams',
    title: 'Remote & Distributed Teams',
    description: 'Stay aligned across time zones with async updates, daily summaries, and centralized project context.',
    icon: 'Globe',
    accent: '#34D399',
    highlights: ['Async updates', 'Timezone support', 'Centralized context'],
  },
];
