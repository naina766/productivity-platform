'use client';

import { Calendar, User, CheckSquare, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TaskSummary, TaskPriority, TaskStatus } from '@/types/task';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task';
import { isTaskOverdue } from '@/lib/tasks/date-utils';

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  LOW: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
  MEDIUM: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  HIGH: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  URGENT: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_BADGE: Record<TaskStatus, string> = {
  TODO: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
  IN_PROGRESS: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  IN_REVIEW: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  DONE: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

interface TaskListProps {
  tasks: TaskSummary[];
  onTaskClick: (task: TaskSummary) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_100px_120px_100px] gap-4 px-5 py-3 border-b border-[var(--border-color)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Assignee</span>
        <span>Due</span>
      </div>

      {/* Rows */}
      {tasks.map((task, i) => {
        const isOverdue = isTaskOverdue(task.dueDate, task.status);

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onTaskClick(task)}
            className="grid grid-cols-[1fr_120px_100px_120px_100px] gap-4 px-5 py-3.5 border-b border-[var(--border-color)] last:border-b-0 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors items-center"
          >
            {/* Title + description */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {task.title}
                </h4>
                {(task as { projectName?: string }).projectName && (
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                    {(task as { projectName?: string }).projectName}
                  </span>
                )}
                {task.milestone && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-1.5 py-0.5 rounded shrink-0"
                    title={`Milestone: ${task.milestone.title}`}
                  >
                    <Flag className="w-2.5 h-2.5" />
                    <span>{task.milestone.title}</span>
                  </span>
                )}
                {(task.subtaskCount ?? 0) > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${
                      task.completedSubtaskCount === task.subtaskCount
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-[var(--text-muted)] bg-neutral-800/60 border-neutral-700/40'
                    }`}
                    title={`${task.completedSubtaskCount ?? 0} of ${task.subtaskCount} subtasks completed`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>
                      {task.completedSubtaskCount ?? 0}/{task.subtaskCount}
                    </span>
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                  {task.description}
                </p>
              )}
            </div>

            {/* Status */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border w-fit ${STATUS_BADGE[task.status]}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>

            {/* Priority */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border w-fit ${PRIORITY_BADGE[task.priority]}`}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>

            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              {task.assignee ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-semibold text-emerald-400">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] truncate">
                    {task.assignee.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Unassigned
                </span>
              )}
            </div>

            {/* Due date */}
            <div>
              {task.dueDate ? (
                <span
                  className={`inline-flex items-center gap-1 text-xs ${
                    isOverdue ? 'text-red-400' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">—</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
