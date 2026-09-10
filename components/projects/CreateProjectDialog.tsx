'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FolderPlus, AlertCircle } from 'lucide-react';
import { apiCreateProject } from '@/lib/api/client';
import type { ProjectDetail } from '@/types/project';

interface CreateProjectDialogProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (project: ProjectDetail) => void;
}

export function CreateProjectDialog({
  workspaceId,
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setError(null);
      setSaving(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

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
      const res = await apiCreateProject(workspaceId, {
        name: trimmedName,
        description: description.trim() || undefined,
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
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

          {/* Dialog */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FolderPlus className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h2 id="create-project-title" className="text-base font-semibold text-[var(--text-primary)]">
                    Create Project
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
                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="create-project-name"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                  >
                    Project name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="create-project-name"
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    maxLength={100}
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {trimmedName.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="create-project-description"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                  >
                    Description{' '}
                    <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="create-project-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    rows={3}
                    maxLength={500}
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none disabled:opacity-50"
                  />
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
                    id="create-project-submit-btn"
                    type="submit"
                    disabled={!isValid || saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4" />
                        Create Project
                      </>
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
