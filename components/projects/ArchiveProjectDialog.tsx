'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Archive, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { apiArchiveProject } from '@/lib/api/client';

interface ArchiveProjectDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
  onArchived: () => void;
}

export function ArchiveProjectDialog({
  projectId,
  projectName,
  open,
  onClose,
  onArchived,
}: ArchiveProjectDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    setSaving(true);
    setError(null);
    try {
      await apiArchiveProject(projectId);
      onArchived();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive project.');
    } finally {
      setSaving(false);
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
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="archive-project-title"
            aria-describedby="archive-project-desc"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Archive className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 id="archive-project-title" className="text-base font-semibold text-[var(--text-primary)]">
                    Archive Project
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  disabled={saving}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-elevated)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p id="archive-project-desc" className="text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">&ldquo;{projectName}&rdquo;</span>{' '}
                      will be archived and hidden from your active projects.
                    </p>
                    <p className="text-[var(--text-muted)] mt-1">
                      Your data, tasks, and members are preserved. You can restore this project later.
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 px-6 pb-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="archive-project-confirm-btn"
                  type="button"
                  onClick={handleArchive}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 active:scale-95"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Archiving…</>
                  ) : (
                    <><Archive className="w-4 h-4" /> Archive Project</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
