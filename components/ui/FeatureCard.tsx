'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  CalendarClock,
  Users,
  BarChart3,
  Zap,
  Radio,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { Feature } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  Bot,
  CalendarClock,
  Users,
  BarChart3,
  Zap,
  Radio,
  Search,
  ShieldCheck,
};

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const IconComponent = iconMap[feature.icon] || Zap;

  // First two cards span 2 cols on lg for bento variation
  const isWide = index === 0 || index === 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`group relative p-6 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-emerald-500/35 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between ${
        isWide ? 'lg:col-span-2' : ''
      }`}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/4 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <IconComponent className="w-5 h-5 transition-transform duration-300" />
          </div>

          {feature.badge && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-[var(--accent-teal)] border border-teal-500/20">
              {feature.badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
          {feature.title}
        </h3>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          {feature.description}
        </p>
      </div>

      {feature.highlight && (
        <div className="relative pt-3 border-t border-[var(--border-color)]/50 flex items-center text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 flex-shrink-0" />
          <span>{feature.highlight}</span>
        </div>
      )}
    </motion.div>
  );
};