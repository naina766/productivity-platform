import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Layers, MessageSquareCode, Rocket } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create',
      tagline: 'Set up projects, goals and teams in minutes.',
      description: 'Import existing backlogs from Jira, GitHub, or Linear. Define milestone goals and assign squad capacity without starting from scratch.',
      icon: Layers,
    },
    {
      step: '02',
      title: 'Collaborate',
      tagline: 'Bring tasks, discussions and decisions together.',
      description: 'Break down complex epics with AI task suggestions. Discuss blockers in live contextual threads tied directly to pull requests and design specs.',
      icon: MessageSquareCode,
    },
    {
      step: '03',
      title: 'Deliver',
      tagline: 'Use intelligent insights to eliminate bottlenecks and ship faster.',
      description: 'Real-time velocity forecasts detect stalled reviews before they impact delivery dates. Auto-generate changelogs and publish release notes effortlessly.',
      icon: Rocket,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle emerald ambient */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/20 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seamless Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light:text-neutral-950 tracking-tight mb-4">
            From idea to impact in three steps.
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
            Eliminate chaotic onboarding and steep learning curves. NOVA is engineered to get your squad into deep execution flow within minutes.
          </p>
        </motion.div>

        {/* 3-step grid with connecting line */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-lime-500/20 -translate-y-8 z-0"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
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
                  className="relative p-7 rounded-2xl bg-[#111111] dark:bg-[#111111] light:bg-white border border-white/8 dark:border-white/8 light:border-neutral-200 hover:border-emerald-500/35 dark:hover:border-emerald-500/35 light:hover:border-emerald-500/35 shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/4 to-transparent pointer-events-none" />

                  <div className="relative">
                    {/* Top Row: Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent font-mono">
                        {item.step}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-white/5 dark:bg-white/5 light:bg-neutral-100 flex items-center justify-center text-emerald-400 dark:text-emerald-400 light:text-emerald-600 border border-white/8 dark:border-white/8 light:border-neutral-200 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white dark:text-white light:text-neutral-900 mb-2">
                      {item.title}
                    </h3>

                    <h4 className="text-sm font-semibold text-emerald-400 dark:text-emerald-400 light:text-emerald-600 mb-3">
                      &ldquo;{item.tagline}&rdquo;
                    </h4>

                    <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative pt-6 mt-6 border-t border-white/5 dark:border-white/5 light:border-neutral-100 flex items-center text-xs font-medium text-neutral-500 group-hover:text-emerald-400 transition-colors">
                    <span>Explore Step {item.step} Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
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
