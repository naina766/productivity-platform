'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, Plus, Loader2, AlertCircle, UserMinus, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  apiGetWorkspaceMembers,
  apiUpdateWorkspaceMemberRole,
  apiRemoveWorkspaceMember,
} from '@/lib/api/client';
import type { WorkspaceMemberItem } from '@/types/workspace';
import type { WorkspaceRole } from '@/types/project';
import { AddMemberDialog } from '@/components/workspace/AddMemberDialog';
import { getErrorMessage } from '@/lib/errors';

interface WorkspaceMembersProps {
  workspaceId: string;
  currentRole: WorkspaceRole;
}

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

const ROLE_BADGE: Record<WorkspaceRole, string> = {
  OWNER: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
  ADMIN: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  MEMBER: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400',
};

export function WorkspaceMembers({ workspaceId, currentRole }: WorkspaceMembersProps) {
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const canManage = currentRole === 'OWNER' || currentRole === 'ADMIN';

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetWorkspaceMembers(workspaceId);
      setMembers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }

  }, [workspaceId]);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  // Auto-dismiss success/error notice
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  function handleAdded(member: WorkspaceMemberItem) {
    setMembers((prev) => [...prev, member]);
    setNotice(`Added ${member.user.name || member.user.email} to the workspace.`);
    setAddOpen(false);
  }

  async function handleRoleChange(member: WorkspaceMemberItem, role: WorkspaceRole) {
    if (member.role === role || actionUserId) return;
    setActionUserId(member.userId);
    try {
      const res = await apiUpdateWorkspaceMemberRole(workspaceId, member.userId, { role });
      setMembers((prev) => prev.map((m) => (m.userId === member.userId ? res.data : m)));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to update the role.');
    } finally {
      setActionUserId(null);
    }
  }

  async function handleRemove(member: WorkspaceMemberItem) {
    if (actionUserId) return;
    setActionUserId(member.userId);
    try {
      await apiRemoveWorkspaceMember(workspaceId, member.userId);
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      setNotice('Member removed from the workspace.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to remove the member.');
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Members</h2>
          {!loading && (
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md font-medium">
              {members.length}
            </span>
          )}
        </div>
        {canManage && (
          <button
            id="add-member-btn"
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white transition-all duration-150 shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add member
          </button>
        )}
      </div>

      {/* Notice */}
      {notice && (
        <div className="mb-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
          {notice}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            type="button"
            onClick={() => void fetchMembers()}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-[var(--text-secondary)]">No members yet.</p>
          {canManage && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Add the first member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const isBusy = actionUserId === member.userId;
            const isOwner = member.role === 'OWNER';

            return (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                  isBusy
                    ? 'opacity-60'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-teal-400">
                      {(member.user.name || member.user.email || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {member.user.name || member.user.email}

                      {isOwner && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 align-middle">
                          <Shield className="w-3 h-3" />
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{member.user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${ROLE_BADGE[member.role]}`}
                  >
                    {ROLE_LABELS[member.role]}
                  </span>

                  {canManage && !isOwner && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          void handleRoleChange(member, e.target.value as WorkspaceRole)
                        }
                        disabled={isBusy}
                        aria-label={`Change ${member.user.name}'s role`}
                        className="px-2 py-1 rounded-lg text-xs font-medium bg-[var(--card-main)] border border-[var(--border-color)] text-[var(--text-primary)] appearance-none focus:outline-none focus:border-emerald-500/60 transition-all disabled:opacity-50"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => void handleRemove(member)}
                        disabled={isBusy}
                        aria-label={`Remove ${member.user.name} from workspace`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AddMemberDialog
        workspaceId={workspaceId}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}