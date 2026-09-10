export type Theme = 'dark' | 'light' | 'system';

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  highlight?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar: string;
  metric?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  ctaText: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SolutionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  highlights: string[];
}

export interface Company {
  name: string;
  symbol: string;
  subtitle: string;
}
