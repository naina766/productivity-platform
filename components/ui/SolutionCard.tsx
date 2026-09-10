'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Terminal,
  Megaphone,
  Rocket,
  Briefcase,
  Globe,
  Users2,
  type LucideIcon,
  CheckCircle,
} from 'lucide-react';
import type { SolutionItem } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  Layers,
  Terminal,
  Megaphone,
  Rocket,
  Briefcase,
  Globe,
  Users2,
};

interface SolutionCardProps {
  solution: SolutionItem;
  index: number;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution, index }) => {
  const Icon = iconMap[solution.icon] || Layers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="p-7 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-emerald-500/30 shadow-xl transition-all duration-300 flex flex-col justify-between group"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/3 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div
            style={{ borderColor: `${solution.accent}40`, backgroundColor: `${solution.accent}15` }}
            className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
          >
            <Icon style={{ color: solution.accent }} className="w-6 h-6" />
          </div>
          <span
            style={{ color: solution.accent }}
            className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
          >
            Use Case 0{index + 1}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2.5">
          {solution.title}
        </h3>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
          {solution.description}
        </p>
      </div>

      <div className="relative pt-4 border-t border-[var(--border-color)]/50 space-y-2">
        {solution.highlights.map((highlight) => (
          <div
            key={highlight}
            className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
          >
            <CheckCircle style={{ color: solution.accent }} className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{highlight}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};