'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { featuresData } from '@/data/features';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { Sparkles } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* NOVA green ambient lighting — no blue/purple */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-40 w-96 h-96 bg-emerald-600/8 blur-[100px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 w-96 h-96 bg-teal-600/6 blur-[100px] rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-emerald-500/20 text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Everything you need</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            Purpose-built for organized teams.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Workspaces, tasks, collaboration, and progress tracking — everything your team needs to
            keep work moving, all in one place.
          </p>
        </motion.div>

        {/* Bento-inspired grid — varied sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {featuresData.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};