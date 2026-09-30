'use client';
/* eslint-disable react/set-state-in-effect */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Pencil, AlertCircle } from 'lucide-react';
import { apiUpdateProject } from '@/lib/api/client';
import type { ProjectDetail, ProjectStatus, ProjectPriority } from '@/types/project';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

interface EditProjectDialogProps {
  project: ProjectDetail;
  open: boolean;
  onClose: () => void;
  onUpdated: (project: ProjectDetail) => void;
}

export function EditProjectDialog({
  project,
  open,
  onClose,
  onUpdated,
}: EditProjectDialogProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [priority, setPriority] = useState<ProjectPriority>(project.priority);
  const [startDate, setStartDate] = useState(
    project.startDate ? project.startDate.slice(0, 10) : '',
  );
  const [dueDate, setDueDate] = useState(
    project.dueDate ? project.dueDate.slice(0, 10) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Sync form state when project changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description ?? '');
      setStatus(project.status);
      setPriority(project.priority);
      setStartDate(project.startDate ? project.startDate.slice(0, 10) : '');
      setDueDate(project.dueDate ? project.dueDate.slice(0, 10) : '');
      setError(null);
      setSaving(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open, project]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2 && trimmedName.length <= 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await apiUpdateProject(project.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        status,
        priority,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    'w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50';

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
            aria-labelledby="edit-project-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-md rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl overflow-hidden my-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-teal-400" />
                  </div>
                  <h2 id="edit-project-title" className="text-base font-semibold text-[var(--text-primary)]">
                    Edit Project
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

                {/* Name */}
                <div>
                  <label htmlFor="edit-project-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Project name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="edit-project-name"
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="edit-project-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Description <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="edit-project-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none disabled:opacity-50"
                  />
                </div>

                {/* Status + Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-project-status" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      Status
                    </label>
                    <select
                      id="edit-project-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      disabled={saving}
                      className={selectClass}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-project-priority" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      Priority
                    </label>
                    <select
                      id="edit-project-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                      disabled={saving}
                      className={selectClass}
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-project-start" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      Start date
                    </label>
                    <input
                      id="edit-project-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={saving}
                      className={selectClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-project-due" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      Due date
                    </label>
                    <input
                      id="edit-project-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                      className={selectClass}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    id="edit-project-submit-btn"
                    type="submit"
                    disabled={!isValid || saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-teal-500/20 active:scale-95"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Pencil className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
