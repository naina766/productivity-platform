'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Loader2,
  AlertCircle,
  Crown,
  ChevronDown,
} from 'lucide-react';
import {
  apiAddProjectMember,
  apiUpdateProjectMember,
  apiRemoveProjectMember,
} from '@/lib/api/client';
import type { ProjectMemberItem, WorkspaceRole } from '@/types/project';

// ─── Role display map ─────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<WorkspaceRole, { label: string; className: string; icon?: React.ReactNode }> = {
  OWNER: {
    label: 'Owner',
    className: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    icon: <Crown className="w-3 h-3" />,
  },
  ADMIN: {
    label: 'Admin',
    className: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    icon: <Shield className="w-3 h-3" />,
  },
  MEMBER: {
    label: 'Member',
    className: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
  },
};

const ASSIGNABLE_ROLES: WorkspaceRole[] = ['ADMIN', 'MEMBER'];

// ─── Avatar initials ──────────────────────────────────────────────────────────

function Initials({ name }: { name: string }) {
  const parts = name.split(' ');
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-emerald-400 uppercase">{initials}</span>
    </div>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: ProjectMemberItem;
  canManage: boolean;
  projectId: string;
  onRoleChange: (userId: string, role: WorkspaceRole) => void;
  onRemove: (userId: string) => void;
}

function MemberRow({ member, canManage, projectId, onRoleChange, onRemove }: MemberRowProps) {
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const role = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER;

  async function handleRoleChange(newRole: WorkspaceRole) {
    setWorking(true);
    setErr(null);
    try {
      await apiUpdateProjectMember(projectId, member.userId, { role: newRole });
      onRoleChange(member.userId, newRole);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update role.');
    } finally {
      setWorking(false);
    }
  }

  async function handleRemove() {
    setWorking(true);
    setErr(null);
    try {
      await apiRemoveProjectMember(projectId, member.userId);
      onRemove(member.userId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to remove member.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-3 py-3"
    >
      <Initials name={member.user.name} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{member.user.name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{member.user.email}</p>
      </div>

      {/* Role badge / selector */}
      {canManage && member.role !== 'OWNER' ? (
        <div className="relative">
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value as WorkspaceRole)}
            disabled={working}
            aria-label={`Role for ${member.user.name}`}
            className={`appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold border cursor-pointer disabled:opacity-50 bg-transparent ${role.className}`}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r} className="bg-[var(--card-main)] text-[var(--text-primary)]">
                {ROLE_CONFIG[r].label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
        </div>
      ) : (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${role.className}`}
        >
          {role.icon}
          {role.label}
        </span>
      )}

      {/* Remove */}
      {canManage && member.role !== 'OWNER' && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={working}
          aria-label={`Remove ${member.user.name}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
        >
          {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      )}

      {err && (
        <p className="absolute text-xs text-red-400 mt-1">{err}</p>
      )}
    </motion.div>
  );
}

// ─── Add member form ──────────────────────────────────────────────────────────

interface AddMemberFormProps {
  projectId: string;
  onAdded: (member: ProjectMemberItem) => void;
}

function AddMemberForm({ projectId, onAdded }: AddMemberFormProps) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiAddProjectMember(projectId, { userId: userId.trim(), role });
      onAdded(res.data);
      setUserId('');
      setRole('MEMBER');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all"
      >
        <UserPlus className="w-3.5 h-3.5" />
        Add Member
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      onSubmit={handleSubmit}
      className="mt-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3"
    >
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
      <div>
        <label htmlFor="add-member-userid" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          User ID
        </label>
        <input
          id="add-member-userid"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Paste workspace member's user ID"
          required
          disabled={saving}
          className="w-full px-3 py-2 rounded-lg bg-[var(--card-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>
      <div>
        <label htmlFor="add-member-role" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Role
        </label>
        <select
          id="add-member-role"
          value={role}
          onChange={(e) => setRole(e.target.value as WorkspaceRole)}
          disabled={saving}
          className="w-full px-3 py-2 rounded-lg bg-[var(--card-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60 transition-all"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          disabled={saving}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !userId.trim()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-semibold transition-all active:scale-95"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
          {saving ? 'Adding…' : 'Add'}
        </button>
      </div>
    </motion.form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProjectMembersProps {
  projectId: string;
  initialMembers: ProjectMemberItem[];
  canManage: boolean;
}

export function ProjectMembers({ projectId, initialMembers, canManage }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMemberItem[]>(initialMembers);

  function handleRoleChange(userId: string, role: WorkspaceRole) {
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, role } : m)),
    );
  }

  function handleRemove(userId: string) {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }

  function handleAdded(member: ProjectMemberItem) {
    setMembers((prev) => [...prev, member]);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Members
          </h3>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        {canManage && (
          <AddMemberForm projectId={projectId} onAdded={handleAdded} />
        )}
      </div>

      {/* Member list */}
      {members.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          No project members yet.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border-color)]">
          <AnimatePresence initial={false}>
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                canManage={canManage}
                projectId={projectId}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
