'use client';

import { Calendar, GripVertical } from 'lucide-react';
import type { TaskSummary, TaskPriority } from '@/types/task';

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: 'bg-neutral-400',
  MEDIUM: 'bg-lime-400',
  HIGH: 'bg-amber-400',
  URGENT: 'bg-red-400',
};

interface TaskCardProps {
  task: TaskSummary;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      onClick={onClick}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      draggable
      className={`group rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3.5 cursor-pointer hover:border-[var(--text-muted)]/40 transition-all select-none ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          <h4 className="text-sm font-medium text-[var(--text-primary)] truncate leading-snug">
            {task.title}
          </h4>
        </div>
        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${PRIORITY_DOT[task.priority]}`} />
      </div>

      {task.description && (
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2.5 ml-5.5 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5 ml-5.5">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border"
              style={{
                color: label.color,
                backgroundColor: `${label.color}15`,
                borderColor: `${label.color}30`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between ml-5.5">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                isOverdue ? 'text-red-400' : 'text-[var(--text-muted)]'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"
            title={task.assignee.name}
          >
            <span className="text-[10px] font-semibold text-emerald-400">
              {task.assignee.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
