'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertCircle, CheckCircle2, Clock, PlayCircle, Eye } from 'lucide-react';
import { calculateProjectTaskStats } from '@/lib/projects/project-progress';
import { isTaskOverdue } from '@/lib/tasks/date-utils';
import type { TaskSummary } from '@/types/task';

interface ProjectProgressCardProps {
  tasks: TaskSummary[];
  loading?: boolean;
}

export function ProjectProgressCard({ tasks, loading }: ProjectProgressCardProps) {
  const stats = useMemo(() => calculateProjectTaskStats(tasks), [tasks]);

  const overdueCount = useMemo(() => {
    return tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;
  }, [tasks]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-6 animate-pulse">
        <div className="h-5 w-40 bg-neutral-800 rounded mb-4" />
        <div className="h-3 w-full bg-neutral-800 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-12 bg-neutral-800 rounded-xl" />
          <div className="h-12 bg-neutral-800 rounded-xl" />
          <div className="h-12 bg-neutral-800 rounded-xl" />
          <div className="h-12 bg-neutral-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-6"
    >
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Project Progress</h2>
        </div>

        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              {overdueCount} {overdueCount === 1 ? 'task' : 'tasks'} overdue
            </span>
          )}
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            {stats.completionRate}% complete
          </span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={stats.completionRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Project progress: ${stats.completionRate}%`}
        className="w-full bg-neutral-800/80 rounded-full h-2.5 overflow-hidden border border-white/5 mb-6"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stats.completionRate}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 shadow-sm shadow-emerald-500/30"
        />
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>To Do</span>
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">{stats.todo}</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>In Progress</span>
          </div>
          <span className="text-sm font-bold text-sky-400">{stats.inProgress}</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>In Review</span>
          </div>
          <span className="text-sm font-bold text-purple-400">{stats.inReview}</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Done</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">{stats.completed}</span>
        </div>
      </div>
    </motion.div>
  );
}
