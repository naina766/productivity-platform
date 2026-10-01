'use client';

import { Search, X } from 'lucide-react';
import type { TaskStatus, TaskPriority, TaskSort } from '@/types/task';
import type { ProjectMemberItem } from '@/types/project';
import type { MilestoneItem } from '@/types/milestone';
import { ALL_TASK_STATUSES, ALL_TASK_PRIORITIES, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/task';

interface TaskFiltersProps {
  status: TaskStatus | undefined;
  priority: TaskPriority | undefined;
  assigneeId: string;
  milestoneId?: string;
  search: string;
  sort: TaskSort;
  members: ProjectMemberItem[];
  milestones?: MilestoneItem[];
  onStatusChange: (status: TaskStatus | undefined) => void;
  onPriorityChange: (priority: TaskPriority | undefined) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onMilestoneChange?: (milestoneId: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: TaskSort) => void;
  onClear: () => void;
}

export function TaskFilters({
  status,
  priority,
  assigneeId,
  milestoneId,
  search,
  sort,
  members,
  milestones,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onMilestoneChange,
  onSearchChange,
  onSortChange,
  onClear,
}: TaskFiltersProps) {
  const hasFilters = status || priority || assigneeId || search || milestoneId;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Status filter */}
      <select
        value={status ?? ''}
        onChange={(e) => onStatusChange(e.target.value ? (e.target.value as TaskStatus) : undefined)}
        className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500/60 transition-all appearance-none min-w-[110px]"
      >
        <option value="">All statuses</option>
        {ALL_TASK_STATUSES.map((s) => (
          <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={priority ?? ''}
        onChange={(e) => onPriorityChange(e.target.value ? (e.target.value as TaskPriority) : undefined)}
        className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500/60 transition-all appearance-none min-w-[110px]"
      >
        <option value="">All priorities</option>
        {ALL_TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>
        ))}
      </select>

      {/* Assignee filter */}
      <select
        value={assigneeId}
        onChange={(e) => onAssigneeChange(e.target.value)}
        className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500/60 transition-all appearance-none min-w-[120px]"
      >
        <option value="">All assignees</option>
        <option value="unassigned">Unassigned</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>{m.user.name}</option>
        ))}
      </select>

      {/* Milestone filter */}
      {milestones && milestones.length > 0 && (
        <select
          value={milestoneId ?? ''}
          onChange={(e) => onMilestoneChange?.(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500/60 transition-all appearance-none min-w-[120px]"
        >
          <option value="">All milestones</option>
          <option value="none">No milestone</option>
          {milestones.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as TaskSort)}
        className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500/60 transition-all appearance-none min-w-[110px]"
      >
        <option value="position">Position</option>
        <option value="createdAt">Created</option>
        <option value="updatedAt">Updated</option>
        <option value="dueDate">Due date</option>
        <option value="priority">Priority</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-muted)]/40 transition-all"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
