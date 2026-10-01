'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { MilestoneItem, MilestoneStatus } from '@/types/milestone';
import {
  apiGetProjectMilestones,
  apiUpdateMilestone,
  apiDeleteMilestone,
} from '@/lib/api/client';
import { CreateMilestoneDialog } from './CreateMilestoneDialog';
import { isTaskOverdue } from '@/lib/tasks/date-utils';

interface MilestonesListProps {
  projectId: string;
  canManage?: boolean;
  selectedMilestoneId?: string;
  onFilterByMilestone?: (milestoneId: string | undefined) => void;
  onMilestonesChange?: (milestones: MilestoneItem[]) => void;
}

export function MilestonesList({
  projectId,
  canManage = false,
  selectedMilestoneId,
  onFilterByMilestone,
  onMilestonesChange,
}: MilestonesListProps) {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetProjectMilestones(projectId);
      const list = res.data.milestones;
      setMilestones(list);
      onMilestonesChange?.(list);
    } catch {
      setError('Failed to load project milestones.');
    } finally {
      setLoading(false);
    }
  }, [projectId, onMilestonesChange]);

  useEffect(() => {
    void fetchMilestones();
  }, [fetchMilestones]);

  const handleToggleStatus = async (milestone: MilestoneItem) => {
    const nextStatus: MilestoneStatus = milestone.status === 'OPEN' ? 'COMPLETED' : 'OPEN';
    const previous = [...milestones];
    const updated = milestones.map((m) =>
      m.id === milestone.id ? { ...m, status: nextStatus } : m
    );
    setMilestones(updated);

    try {
      const res = await apiUpdateMilestone(milestone.id, { status: nextStatus });
      setMilestones((current) => {
        const next = current.map((m) => (m.id === milestone.id ? res.data : m));
        onMilestonesChange?.(next);
        return next;
      });
    } catch {
      setMilestones(previous);
      onMilestonesChange?.(previous);
      setError('Failed to update milestone status.');
    }
  };

  const handleDelete = async (milestoneId: string) => {
    const previous = [...milestones];
    const nextList = previous.filter((m) => m.id !== milestoneId);
    setMilestones(nextList);
    onMilestonesChange?.(nextList);

    try {
      await apiDeleteMilestone(milestoneId);
      if (selectedMilestoneId === milestoneId) {
        onFilterByMilestone?.(undefined);
      }
    } catch {
      setMilestones(previous);
      onMilestonesChange?.(previous);
      setError('Failed to delete milestone.');
    }
  };

  const handleMilestoneCreated = (created: MilestoneItem) => {
    setMilestones((current) => {
      const next = [...current, created];
      onMilestonesChange?.(next);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Project Milestones
          </h2>
          {milestones.length > 0 && (
            <span className="text-xs text-[var(--text-muted)] font-medium">
              ({milestones.filter((m) => m.status === 'COMPLETED').length}/{milestones.length} done)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedMilestoneId && (
            <button
              type="button"
              onClick={() => onFilterByMilestone?.(undefined)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Filter className="w-3 h-3" />
              <span>Clear Filter</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Milestone</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-[var(--text-muted)] gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading milestones...</span>
        </div>
      ) : milestones.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-[var(--text-muted)] mb-3">
            No milestones defined for this project yet.
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Milestone</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence initial={false}>
            {milestones.map((milestone) => {
              const isSelected = selectedMilestoneId === milestone.id;
              const isOverdue =
                milestone.dueDate &&
                milestone.status === 'OPEN' &&
                isTaskOverdue(milestone.dueDate, 'TODO');

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-4 rounded-xl bg-neutral-900/40 border transition-all ${
                    isSelected
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/10 bg-emerald-500/[0.03]'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            milestone.status === 'COMPLETED'
                              ? 'text-teal-400 bg-teal-400/10 border-teal-400/20'
                              : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                          }`}
                        >
                          {milestone.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {milestone.status}
                        </span>

                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
                            Overdue
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {milestone.title}
                      </h3>
                      {milestone.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                          {milestone.description}
                        </p>
                      )}
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(milestone)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                          title={milestone.status === 'OPEN' ? 'Mark Completed' : 'Reopen Milestone'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(milestone.id)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 mb-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-1 text-[var(--text-secondary)]">
                      <span>
                        {milestone.completedTaskCount} of {milestone.taskCount} tasks completed
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {milestone.progressPercentage}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={milestone.progressPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${milestone.title} progress: ${milestone.progressPercentage}%`}
                      className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${milestone.progressPercentage}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
                      {milestone.dueDate ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          <span>
                            Due{' '}
                            {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </>
                      ) : (
                        <span>No target date set</span>
                      )}
                    </div>

                    {onFilterByMilestone && (
                      <button
                        type="button"
                        onClick={() =>
                          onFilterByMilestone(isSelected ? undefined : milestone.id)
                        }
                        className={`text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? 'text-emerald-400 hover:underline'
                            : 'text-[var(--text-muted)] hover:text-emerald-400'
                        }`}
                      >
                        {isSelected ? 'Viewing Tasks ✓' : 'View Tasks →'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <CreateMilestoneDialog
        projectId={projectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleMilestoneCreated}
      />
    </motion.div>
  );
}
