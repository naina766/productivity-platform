'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Pencil,
  Tag,
  MessageSquare,
  Activity,
  Info,
} from 'lucide-react';
import type { TaskDetail } from '@/types/task';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task';
import { CommentSection } from '@/components/comments/CommentSection';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { SubtaskList } from '@/components/tasks/SubtaskList';
import { isTaskOverdue } from '@/lib/tasks/date-utils';

const STATUS_BADGE: Record<string, string> = {
  TODO: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
  IN_PROGRESS: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  IN_REVIEW: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  DONE: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-neutral-400',
  MEDIUM: 'bg-lime-400',
  HIGH: 'bg-amber-400',
  URGENT: 'bg-red-400',
};

type Tab = 'details' | 'comments' | 'activity';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'details', label: 'Details', icon: Info },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'activity', label: 'Activity', icon: Activity },
];

interface TaskDetailProps {
  task: TaskDetail;
  open: boolean;
  onClose: () => void;
  onEdit: (task: TaskDetail) => void;
  canModerate?: boolean;
}

export function TaskDetailPanel({
  task,
  open,
  onClose,
  onEdit,
  canModerate = false,
}: TaskDetailProps) {
  const [tab, setTab] = useState<Tab>('details');
  const isOverdue = isTaskOverdue(task.dueDate, task.status);

  // Reset to the details tab whenever a different task is opened.
  useEffect(() => {
    setTab('details');
  }, [task.id]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={`Task: ${task.title}`}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--card-main)] border-l border-[var(--border-color)] shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] sticky top-0 bg-[var(--card-main)] z-10">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate pr-4">
                Task Details
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-elevated)] transition-all"
                  aria-label="Edit task"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-elevated)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="px-6 pt-5 pb-4 border-b border-[var(--border-color)]">
              <h1 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
                {task.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap mt-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_BADGE[task.status]}`}>
                  {TASK_STATUS_LABELS[task.status]}
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                  <span className="text-xs text-[var(--text-muted)]">{TASK_PRIORITY_LABELS[task.priority]} priority</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Task sections"
              className="flex items-center border-b border-[var(--border-color)] px-3"
            >
              {TABS.map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  aria-controls={`task-tab-${id}`}
                  onClick={() => setTab(id)}
                  className={`relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                    tab === id
                      ? 'text-emerald-400'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {label}
                  {tab === id && (
                    <motion.span
                      layoutId={`task-tab-indicator-${task.id}`}
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-emerald-400"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-${task.id}`}
                id={`task-tab-${tab}`}
                role="tabpanel"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                {tab === 'details' && (
                  <div className="space-y-5">
                    {task.description && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Description</p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                          {task.description}
                        </p>
                      </div>
                    )}

                    {task.labels.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Labels</p>
                        <div className="flex flex-wrap gap-1.5">
                          {task.labels.map((label) => (
                            <span
                              key={label.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                              style={{
                                color: label.color,
                                backgroundColor: `${label.color}15`,
                                borderColor: `${label.color}30`,
                              }}
                            >
                              <Tag className="w-3 h-3" />
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Assignee</p>
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-[9px] font-semibold text-emerald-400">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-[var(--text-primary)]">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--text-muted)]">Unassigned</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Due date</p>
                          {task.dueDate ? (
                            <span className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-[var(--text-primary)]'}`}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {isOverdue && ' (overdue)'}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--text-muted)]">No due date</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Created</p>
                          <span className="text-sm text-[var(--text-primary)]">
                            {new Date(task.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Last updated</p>
                          <span className="text-sm text-[var(--text-primary)]">
                            {new Date(task.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks checklist */}
                    <div className="pt-4 border-t border-[var(--border-color)]">
                      <SubtaskList taskId={task.id} initialSubtasks={task.subtasks} />
                    </div>
                  </div>
                )}

                {tab === 'comments' && (
                  <CommentSection taskId={task.id} canModerate={canModerate} />
                )}

                {tab === 'activity' && (
                  <ActivityTimeline projectId={task.projectId} taskId={task.id} limit={50} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}