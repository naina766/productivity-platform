import type { Feature } from '@/types';

export const featuresData: Feature[] = [
  {
    id: 'ai-task-assistant',
    icon: 'Bot',
    title: 'AI Task Assistant',
    description: 'Turn repetitive work into automated workflows. Synthesize tasks from discussions, meetings, and project notes with one click.',
    badge: 'Popular',
    highlight: 'Save ~4.5 hrs/week per engineer'
  },
  {
    id: 'smart-project-planning',
    icon: 'CalendarClock',
    title: 'Smart Project Planning',
    description: 'Plan milestones and deadlines with intelligent recommendations. Automatically detect blockers and resource bottlenecks early.',
    badge: 'Smart Engine',
    highlight: 'Dynamic Gantt & Milestone Forecasts'
  },
  {
    id: 'team-collaboration',
    icon: 'Users',
    title: 'Team Collaboration',
    description: 'Keep conversations, tasks, files, and decisions together in persistent context threads that never get buried.',
    highlight: 'Real-time multiplayer canvas'
  },
  {
    id: 'productivity-analytics',
    icon: 'BarChart3',
    title: 'Productivity Analytics',
    description: 'Understand team performance through meaningful insights into cycle times, PR review latency, and focus trends.',
    badge: 'Live Data',
    highlight: 'Objective throughput dashboards'
  },
  {
    id: 'automated-workflows',
    icon: 'Zap',
    title: 'Automated Workflows',
    description: 'Automate repetitive processes and save valuable time. Connect issue tracking, CI/CD signals, and pull requests effortlessly.',
    highlight: '100+ native integrations'
  },
  {
    id: 'real-time-updates',
    icon: 'Radio',
    title: 'Real-Time Updates',
    description: 'Keep everyone aligned with live project updates, instant notifications, and unified executive summaries.',
    highlight: 'Zero sync delays'
  },
  {
    id: 'intelligent-search',
    icon: 'Search',
    title: 'Intelligent Search',
    description: 'Find projects, tasks, and information instantly. Search code references, meeting takeaways, and design files semantically.',
    highlight: 'Sub-millisecond query speed'
  },
  {
    id: 'secure-workspace',
    icon: 'ShieldCheck',
    title: 'Secure Workspace',
    description: "Keep your team's work protected with enterprise-grade encryption, custom role-based permissions, and SOC 2 Type II compliance.",
    badge: 'Enterprise Grade',
    highlight: 'End-to-end data encryption'
  },
];