'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { apiUpdateTask } from '@/lib/api/client';
import type { TaskSummary, TaskStatus } from '@/types/task';
import { TASK_STATUS_LABELS, ALL_TASK_STATUSES } from '@/types/task';

interface TaskBoardProps {
  tasks: TaskSummary[];
  onTaskClick: (task: TaskSummary) => void;
  onTaskUpdated: (task: TaskSummary) => void;
  onNewTask: (status?: TaskStatus) => void;
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  TODO: 'text-neutral-400',
  IN_PROGRESS: 'text-amber-400',
  IN_REVIEW: 'text-teal-400',
  DONE: 'text-emerald-400',
};

export function TaskBoard({ tasks, onTaskClick, onTaskUpdated, onNewTask }: TaskBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const tasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks],
  );

  const handleDragOver = useCallback((e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault();
      setDragOverColumn(null);

      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === targetStatus) return;

      // Optimistic update
      onTaskUpdated({ ...task, status: targetStatus });

      try {
        const res = await apiUpdateTask(taskId, { status: targetStatus });
        onTaskUpdated(res.data);
      } catch {
        // Revert on failure
        onTaskUpdated(task);
      }
    },
    [tasks, onTaskUpdated],
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {ALL_TASK_STATUSES.map((status) => {
        const columnTasks = tasksByStatus(status);
        const isOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className="flex-shrink-0 w-72 min-w-[280px]"
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${COLUMN_COLORS[status]}`}>
                  {TASK_STATUS_LABELS[status]}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-md font-medium">
                  {columnTasks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNewTask(status)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                aria-label={`Add task to ${TASK_STATUS_LABELS[status]}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drop zone */}
            <div
              className={`rounded-2xl border transition-all min-h-[200px] p-2 space-y-2 ${
                isOver
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-transparent'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {columnTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, delay: i * 0.02 }}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && !isOver && (
                <button
                  type="button"
                  onClick={() => onNewTask(status)}
                  className="w-full rounded-xl border border-dashed border-[var(--border-color)] p-6 text-center text-xs text-[var(--text-muted)] hover:border-[var(--text-muted)]/40 hover:text-[var(--text-secondary)] transition-all"
                >
                  No tasks
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
