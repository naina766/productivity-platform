'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { apiAddWorkspaceMember } from '@/lib/api/client';
import type { WorkspaceMemberItem } from '@/types/workspace';

interface AddMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  onAdded: (member: WorkspaceMemberItem) => void;
}

export function AddMemberDialog({ workspaceId, open, onClose, onAdded }: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEmail('');
      setRole('MEMBER');
      setError(null);
      setSaving(false);
      setTimeout(() => emailRef.current?.focus(), 50);
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

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await apiAddWorkspaceMember(workspaceId, {
        email: email.trim().toLowerCase(),
        role,
      });
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.');
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
            aria-labelledby="add-member-title"
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
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h2 id="add-member-title" className="text-base font-semibold text-[var(--text-primary)]">
                    Add workspace member
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

                {/* Email */}
                <div>
                  <label
                    htmlFor="add-member-email"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                  >
                    Email address <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="add-member-email"
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    The user must already have a NOVA account.
                  </p>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="add-member-role"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                  >
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="add-member-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
                    disabled={saving}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm appearance-none focus:outline-none focus:border-emerald-500/60 transition-all disabled:opacity-50"
                  >
                    <option value="MEMBER">Member — can view and work on assigned projects</option>
                    <option value="ADMIN">Admin — can manage projects and workspace members</option>
                  </select>
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
                    id="add-member-submit-btn"
                    type="submit"
                    disabled={!isValid || saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Add member
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