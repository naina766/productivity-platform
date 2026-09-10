import type { SolutionItem } from '@/types';

export const solutionsData: SolutionItem[] = [
  {
    id: 'product-teams',
    title: 'Product Teams',
    description: 'Connect customer feedback, feature roadmaps, and delivery milestones. Automatically generate release notes from completed user stories.',
    icon: 'Layers',
    accent: '#22C55E',   // emerald-500
    highlights: ['Interactive Roadmap Gantt', 'Feature Priority Scoring', 'Automated PRDs'],
  },
  {
    id: 'engineering-teams',
    title: 'Engineering Teams',
    description: 'Manage two-week sprints, triage critical bugs, and correlate pull requests directly to project requirements without jumping tabs.',
    icon: 'Terminal',
    accent: '#14B8A6',   // teal-500
    highlights: ['Git Bidirectional Sync', 'Sprint Velocity Tracking', 'Blocker Detection'],
  },
  {
    id: 'marketing-teams',
    title: 'Marketing Teams',
    description: 'Coordinate multi-channel campaigns, track asset production deadlines, and ensure brand launches go live without missing a beat.',
    icon: 'Megaphone',
    accent: '#84CC16',   // lime-500
    highlights: ['Content Editorial Calendar', 'Asset Approvals', 'Multi-channel Timelines'],
  },
  {
    id: 'startups',
    title: 'Startups',
    description: 'Move from zero to shipping production features at hyper-speed. Cut through chaotic communication and maintain hyper-focus on MVP goals.',
    icon: 'Rocket',
    accent: '#A3E635',   // lime-400
    highlights: ['Pre-built Agile Frameworks', 'Lightweight Setup', 'Zero Maintenance'],
  },
  {
    id: 'agencies',
    title: 'Agencies & Consultancies',
    description: 'Juggle multiple client portfolios, billable milestones, and client-facing status reports with granular guest access permissions.',
    icon: 'Briefcase',
    accent: '#F59E0B',   // amber-500 — allowed (not blue/purple)
    highlights: ['Client Portal Views', 'Multi-tenant Workspaces', 'Budget Burn Tracking'],
  },
  {
    id: 'remote-teams',
    title: 'Remote & Distributed Teams',
    description: 'Stay asynchronous yet deeply aligned across all time zones with AI executive digests, daily standup bots, and live cursor presence.',
    icon: 'Globe',
    accent: '#34D399',   // emerald-400
    highlights: ['Asynchronous Standups', 'Cross-Timezone Hand-offs', 'Centralized Context Hub'],
  },
];