import type { Feature } from '@/types';

export const featuresData: Feature[] = [
  {
    id: 'ai-task-assistant',
    icon: 'Bot',
    title: 'AI Task Assistant',
    description: 'Turn repetitive work into automated workflows. Synthesize tasks from discussions, meetings, and project notes with one click.',
    badge: 'Popular',
    highlight: 'Automated task creation',
  },
  {
    id: 'smart-project-planning',
    icon: 'CalendarClock',
    title: 'Smart Project Planning',
    description: 'Plan milestones and deadlines with intelligent recommendations. Automatically detect blockers and resource bottlenecks early.',
    badge: 'Smart Engine',
    highlight: 'Dynamic milestone tracking',
  },
  {
    id: 'team-collaboration',
    icon: 'Users',
    title: 'Team Collaboration',
    description: 'Keep conversations, tasks, files, and decisions together in persistent context threads that never get buried.',
    highlight: 'Real-time updates',
  },
  {
    id: 'productivity-analytics',
    icon: 'BarChart3',
    title: 'Productivity Analytics',
    description: 'Understand team performance through meaningful insights into cycle times, review latency, and focus trends.',
    badge: 'Live Data',
    highlight: 'Throughput dashboards',
  },
  {
    id: 'automated-workflows',
    icon: 'Zap',
    title: 'Automated Workflows',
    description: 'Automate repetitive processes and save valuable time. Connect issue tracking, CI/CD signals, and pull requests effortlessly.',
    highlight: 'Custom automation rules',
  },
  {
    id: 'real-time-updates',
    icon: 'Radio',
    title: 'Real-Time Updates',
    description: 'Keep everyone aligned with live project updates, instant notifications, and unified executive summaries.',
    highlight: 'Instant notifications',
  },
  {
    id: 'intelligent-search',
    icon: 'Search',
    title: 'Intelligent Search',
    description: 'Find projects, tasks, and information instantly. Search code references, meeting takeaways, and design files.',
    highlight: 'Fast full-text search',
  },
  {
    id: 'secure-workspace',
    icon: 'ShieldCheck',
    title: 'Secure Workspace',
    description: 'Keep your team\'s work protected with encryption, custom role-based permissions, and audit logging.',
    badge: 'Enterprise Grade',
    highlight: 'Role-based access control',
  },
];
