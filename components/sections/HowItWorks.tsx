'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, FolderKanban, CheckSquare2, BarChart3 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create a workspace',
      description:
        'Create a workspace and invite your team. Owners can set up roles and permissions so every member has the right access.',
      icon: Layers,
    },
    {
      step: '02',
      title: 'Organize projects',
      description:
        'Break your workspace into projects — one for each initiative, team, or product area. Each project gets its own board and task list.',
      icon: FolderKanban,
    },
    {
      step: '03',
      title: 'Assign and track tasks',
      description:
        'Create tasks, assign owners, set due dates, and move them across statuses. Every change is logged in the activity feed.',
      icon: CheckSquare2,
    },
    {
      step: '04',
      title: 'Review progress',
      description:
        'Check what is on track, what is overdue, and who is at capacity — all from a single overview without chasing status updates.',
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/5 blur-[120px] rounded-full"
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
            <span>How it works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            Four steps to a more organized team.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            NOVA is designed to take you from sign-up to visible progress in minutes — no
            complex setup, no migration guides.
          </p>
        </motion.div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-lime-500/20 -translate-y-8 z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -4 }}
                  className="relative p-7 rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] hover:border-emerald-500/35 shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/4 to-transparent pointer-events-none" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent font-mono">
                        {item.step}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-[var(--card-main)]/50 flex items-center justify-center text-[var(--accent-primary)] border border-[var(--border-color)] group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                      {item.title}
                    </h3>

                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};