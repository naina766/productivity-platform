'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Mail,
  Copy,
  Check,
  Trash2,
  Loader2,
  X,
  Clock,
  Shield,
  Send,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  apiGetWorkspaceInvitations,
  apiCreateWorkspaceInvitation,
  apiRevokeWorkspaceInvitation,
} from '@/lib/api/client';
import { getErrorMessage } from '@/lib/errors';
import type { WorkspaceInvitationItem } from '@/types/invitation';
import type { WorkspaceRole } from '@/types/project';

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onClose,
  onInviteSent,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [invitations, setInvitations] = useState<WorkspaceInvitationItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [justGeneratedLink, setJustGeneratedLink] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!workspaceId) return;
    setLoadingList(true);
    try {
      const res = await apiGetWorkspaceInvitations(workspaceId);
      setInvitations(res.data);
    } catch {
      // Best-effort
    } finally {
      setLoadingList(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (open) {
      setEmail('');
      setRole('MEMBER');
      setError(null);
      setJustGeneratedLink(null);
      void fetchInvitations();
    }
  }, [open, fetchInvitations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      const res = await apiCreateWorkspaceInvitation(workspaceId, {
        email: email.trim(),
        role,
      });

      const fullUrl = `${window.location.origin}/invite/${res.data.token}`;
      setJustGeneratedLink(fullUrl);
      setEmail('');
      void fetchInvitations();
      if (onInviteSent) onInviteSent();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = (token: string) => {
    if (!token) return;
    const fullUrl = `${window.location.origin}/invite/${token}`;
    void navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      await apiRevokeWorkspaceInvitation(workspaceId, invitationId);
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status: 'REVOKED' } : inv))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const pendingInvitations = invitations.filter((i) => i.status === 'PENDING');

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Invite Team Members"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg rounded-3xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    Invite Team Members
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Invite collaborators with an email or shareable invite link
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-6 flex-1">
              {/* Invite Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      required
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="MEMBER">Member (Can edit tasks and projects)</option>
                      <option value="ADMIN">Admin (Full workspace management)</option>
                    </select>
                  </div>

                  <div className="self-end">
                    <button
                      type="submit"
                      disabled={!email.trim() || sending}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-all duration-150 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Create Invite</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Just Created Link Banner */}
              {justGeneratedLink && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2"
                >
                  <p className="text-xs font-medium text-emerald-400">
                    Invitation link created!
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={justGeneratedLink}
                      className="w-full px-2.5 py-1.5 text-xs bg-[var(--card-main)] border border-emerald-500/30 rounded-lg text-[var(--text-primary)] font-mono selection:bg-emerald-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(justGeneratedLink);
                        setCopiedToken('just-generated');
                        setTimeout(() => setCopiedToken(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shrink-0 flex items-center gap-1.5"
                    >
                      {copiedToken === 'just-generated' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Pending Invitations Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Pending Invitations ({pendingInvitations.length})
                  </h4>
                  {loadingList && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
                </div>

                {pendingInvitations.length === 0 && !loadingList ? (
                  <p className="text-xs text-[var(--text-muted)] py-3 text-center">
                    No pending invitations
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {pendingInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/60 text-xs"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {inv.email}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                            <span className="font-semibold text-emerald-400 uppercase">
                              {inv.role}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              Expires {new Date(inv.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {inv.token ? (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv.token)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] transition-colors"
                              title="Copy invite link"
                            >
                              {copiedToken === inv.token ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => void handleRevoke(inv.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Revoke invitation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--card-main)] border border-[var(--border-color)] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
