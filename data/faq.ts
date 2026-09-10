import type { FAQItem } from '@/types';

export const faqData: FAQItem[] = [
  {
    id: 'what-is-nova',
    question: 'What is NOVA?',
    answer: 'NOVA is an AI-powered team productivity platform that brings project management, automated workflows, asynchronous collaboration, and predictive analytics into a single unified workspace. It eliminates fragmentation by synthesizing tasks, roadmaps, and discussions automatically.',
  },
  {
    id: 'is-nova-free',
    question: 'Is NOVA free to use?',
    answer: 'Yes! NOVA offers a 100% free Starter plan with up to 3 projects, essential task boards, and unlimited team collaboration. We also provide an unrestricted 14-day free trial on our Pro plan with zero credit card required up front.',
  },
  {
    id: 'invite-entire-team',
    question: 'Can I invite my entire team?',
    answer: 'Absolutely. You can invite your entire organization, assign role-based permissions (Admin, Member, Guest, Observer), create department spaces, and share project views with clients without unexpected friction.',
  },
  {
    id: 'integrations',
    question: 'Does NOVA integrate with other tools?',
    answer: 'Yes. NOVA provides seamless, bi-directional integrations with GitHub, GitLab, Slack, Linear, Figma, Google Workspace, Jira, and over 100+ platforms through Webhooks and our robust REST/GraphQL APIs.',
  },
  {
    id: 'cancellation-policy',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, there are zero contracts or lock-ins. You can upgrade, downgrade, or cancel your subscription at any time directly from your workspace billing dashboard with one click. If you cancel, your account remains active until the end of the billing period.',
  },
  {
    id: 'data-security',
    question: "Is my team's data secure?",
    answer: 'Security is at the heart of NOVA. We are SOC 2 Type II compliant, GDPR ready, and enforce AES-256 bit encryption at rest and TLS 1.3 in transit. Your proprietary workspace data is never used to train generalized foundation models without explicit organizational consent.',
  },
];