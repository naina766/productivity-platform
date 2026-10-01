'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { SubtaskItem } from '@/types/task';
import {
  apiGetSubtasks,
  apiCreateSubtask,
  apiUpdateSubtask,
  apiDeleteSubtask,
} from '@/lib/api/client';

interface SubtaskListProps {
  taskId: string;
  initialSubtasks?: SubtaskItem[];
  onSubtasksChange?: (subtasks: SubtaskItem[]) => void;
}

export function SubtaskList({
  taskId,
  initialSubtasks,
  onSubtasksChange,
}: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>(initialSubtasks ?? []);
  const [loading, setLoading] = useState(!initialSubtasks);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const loadSubtasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetSubtasks(taskId);
      const items = res.data.subtasks;
      setSubtasks(items);
      onSubtasksChange?.(items);
    } catch {
      setError('Failed to load subtasks');
    } finally {
      setLoading(false);
    }
  }, [taskId, onSubtasksChange]);

  useEffect(() => {
    if (initialSubtasks) {
      setSubtasks(initialSubtasks);
    } else {
      void loadSubtasks();
    }
  }, [taskId, initialSubtasks, loadSubtasks]);

  const handleToggle = async (subtask: SubtaskItem) => {
    const nextCompleted = !subtask.isCompleted;
    // Optimistic update
    const previous = [...subtasks];
    const updated = subtasks.map((s) =>
      s.id === subtask.id ? { ...s, isCompleted: nextCompleted } : s
    );
    setSubtasks(updated);
    onSubtasksChange?.(updated);

    try {
      const res = await apiUpdateSubtask(subtask.id, { isCompleted: nextCompleted });
      const finalUpdated = updated.map((s) => (s.id === subtask.id ? res.data : s));
      setSubtasks(finalUpdated);
      onSubtasksChange?.(finalUpdated);
    } catch {
      // Revert
      setSubtasks(previous);
      onSubtasksChange?.(previous);
      setError('Failed to update subtask status');
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || adding) return;

    try {
      setAdding(true);
      setError(null);
      const res = await apiCreateSubtask(taskId, { title });
      const updated = [...subtasks, res.data];
      setSubtasks(updated);
      onSubtasksChange?.(updated);
      setNewTitle('');
    } catch {
      setError('Failed to create subtask');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (subtaskId: string) => {
    const previous = [...subtasks];
    const updated = subtasks.filter((s) => s.id !== subtaskId);
    setSubtasks(updated);
    onSubtasksChange?.(updated);

    try {
      await apiDeleteSubtask(subtaskId);
    } catch {
      setSubtasks(previous);
      onSubtasksChange?.(previous);
      setError('Failed to delete subtask');
    }
  };

  const handleStartEdit = (subtask: SubtaskItem) => {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  };

  const handleSaveEdit = async (subtaskId: string) => {
    const title = editTitle.trim();
    if (!title) {
      setEditingId(null);
      return;
    }

    const previous = [...subtasks];
    const updated = subtasks.map((s) => (s.id === subtaskId ? { ...s, title } : s));
    setSubtasks(updated);
    setEditingId(null);

    try {
      const res = await apiUpdateSubtask(subtaskId, { title });
      const finalUpdated = subtasks.map((s) => (s.id === subtaskId ? res.data : s));
      setSubtasks(finalUpdated);
      onSubtasksChange?.(finalUpdated);
    } catch {
      setSubtasks(previous);
      setError('Failed to update subtask');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with count and progress bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Subtasks</span>
          {totalCount > 0 && (
            <span className="font-normal lowercase text-[var(--text-secondary)]">
              ({completedCount}/{totalCount})
            </span>
          )}
        </div>

        {totalCount > 0 && (
          <span className="text-xs font-semibold text-emerald-400">
            {progressPercent}%
          </span>
        )}
      </div>

      {/* Progress Track */}
      {totalCount > 0 && (
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Subtasks completed: ${progressPercent}%`}
          className="w-full bg-neutral-800/80 rounded-full h-1.5 overflow-hidden border border-white/5"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-4 text-[var(--text-muted)] gap-2 text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading subtasks...</span>
        </div>
      ) : subtasks.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] py-1">
          No subtasks yet. Break this task down into smaller steps.
        </p>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {subtasks.map((subtask) => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.15 }}
                className="group flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-neutral-800/40 border border-transparent hover:border-[var(--border-color)] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(subtask)}
                    className="shrink-0 text-[var(--text-muted)] hover:text-emerald-400 transition-colors focus:outline-none"
                    aria-label={subtask.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {subtask.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/10" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500 hover:text-neutral-300" />
                    )}
                  </button>

                  {editingId === subtask.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(subtask.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(subtask.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-neutral-900 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => handleStartEdit(subtask)}
                      className={`text-xs truncate cursor-pointer transition-colors ${
                        subtask.isCompleted
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)] group-hover:text-white'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(subtask.id)}
                  aria-label="Delete subtask"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add subtask input */}
      <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a subtask... (press Enter)"
            maxLength={200}
            disabled={adding}
            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!newTitle.trim() || adding}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {adding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
