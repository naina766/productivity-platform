'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ProjectProgressBarProps {
  completed: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function ProjectProgressBar({
  completed,
  total,
  size = 'md',
  showDetails = true,
  className = '',
}: ProjectProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {completed} of {total} {total === 1 ? 'task' : 'tasks'} done
            </span>
          </span>
          <span className="font-semibold text-emerald-400">
            {percentage}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Project progress: ${percentage}%`}
        className={`w-full bg-neutral-800/80 rounded-full overflow-hidden border border-white/5 ${heightClass}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30"
        />
      </div>
    </div>
  );
}
