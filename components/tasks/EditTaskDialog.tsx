'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Pencil, AlertCircle, Trash2 } from 'lucide-react';
import { apiUpdateTask, apiDeleteTask } from '@/lib/api/client';
import type { TaskDetail, TaskStatus, TaskPriority } from '@/types/task';
import type { ProjectMemberItem } from '@/types/project';
import type { MilestoneItem } from '@/types/milestone';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, ALL_TASK_STATUSES, ALL_TASK_PRIORITIES } from '@/types/task';

interface EditTaskDialogProps {
  task: TaskDetail;
  members: ProjectMemberItem[];
  milestones?: MilestoneItem[];
  canDelete?: boolean;
  open: boolean;
  onClose: () => void;
  onUpdated: (task: TaskDetail) => void;
  onDeleted: (taskId: string) => void;
}

export function EditTaskDialog({
  task,
  members,
  milestones = [],
  canDelete = true,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId ?? '');
  const [milestoneId, setMilestoneId] = useState<string>(task.milestoneId ?? '');
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId ?? '');
      setMilestoneId(task.milestoneId ?? '');
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      );
      setError(null);
      setSaving(false);
      setDeleting(false);
      setConfirmDelete(false);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, task]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const trimmedTitle = title.trim();
  const isValid = trimmedTitle.length >= 1 && trimmedTitle.length <= 200;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await apiUpdateTask(task.id, {
        title: trimmedTitle,
        description: description.trim() || null,
        status,
        priority,
        assigneeId: assigneeId || null,
        milestoneId: milestoneId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);

    try {
      await apiDeleteTask(task.id);
      onDeleted(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task.');
      setDeleting(false);
    }
  }

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
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h2 id="edit-task-title" className="text-base font-semibold text-[var(--text-primary)]">
                    Edit Task
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-elevated)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="edit-task-title-input" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="edit-task-title-input"
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="edit-task-desc" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="edit-task-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={5000}
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none disabled:opacity-50"
                  />
                </div>

                {/* Status + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-task-status" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Status</label>
                    <select
                      id="edit-task-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 appearance-none"
                    >
                      {ALL_TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-task-priority" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Priority</label>
                    <select
                      id="edit-task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 appearance-none"
                    >
                      {ALL_TASK_PRIORITIES.map((p) => (
                        <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignee + Due date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-task-assignee" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Assignee</label>
                    <select
                      id="edit-task-assignee"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 appearance-none"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.userId} value={m.userId}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-task-due" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Due date</label>
                    <input
                      id="edit-task-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Milestone row */}
                {milestones.length > 0 && (
                  <div>
                    <label htmlFor="edit-task-milestone" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      Milestone
                    </label>
                    <select
                      id="edit-task-milestone"
                      value={milestoneId}
                      onChange={(e) => setMilestoneId(e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 appearance-none"
                    >
                      <option value="">No milestone</option>
                      {milestones.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {canDelete && confirmDelete ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Delete this task?</span>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : canDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isValid || saving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Pencil className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
