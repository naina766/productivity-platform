import type { PricingPlan } from '@/types';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Everything a small team needs to get organized. No credit card required.',
    features: [
      'Multiple active projects',
      'Task management & statuses',
      'Team collaboration & comments',
      'Activity feed',
      'Dark & light themes',
    ],
    highlighted: false,
    ctaText: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 10,
    description: 'More projects, more members, and full workspace features for growing teams.',
    features: [
      'Unlimited active projects',
      'Unlimited workspace members',
      'All task statuses & labels',
      'Comments & activity history',
      'Search & filtering',
      'Role-based permissions',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Get Started',
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 29,
    yearlyPrice: 24,
    description: 'Admin tools and dedicated support for teams that need more control.',
    features: [
      'Everything in Pro',
      'Admin & owner role controls',
      'Multi-project management',
      'Activity history per project',
      'Workspace member management',
    ],
    highlighted: false,
    ctaText: 'Get Started',
  },
];