import React from 'react';
import { motion } from 'framer-motion';
import { solutionsData } from '../data/solutions';
import { SolutionCard } from './SolutionCard';
import { Users2 } from 'lucide-react';

export const Solutions: React.FC = () => {
  return (
    <section id="solutions" className="py-24 relative overflow-hidden">
      {/* Ambient glows — no blue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 -right-40 w-96 h-96 bg-teal-600/6 blur-[100px] rounded-full"
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
            <Users2 className="w-3.5 h-3.5" />
            <span>Tailored Solutions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light:text-neutral-950 tracking-tight mb-4">
            Built for teams that build.
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
            Whether you're coordinating engineering sprints, launching growth experiments, or managing client deliverables, NOVA adapts to how your team works best.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutionsData.map((solution, index) => (
            <SolutionCard key={solution.id} solution={solution} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
