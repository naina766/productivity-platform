import React from 'react';
import { MoreHorizontal, MessageSquare, ShieldCheck, UserPlus } from 'lucide-react';
import type { ProductTab } from './ProductTabs';

interface ProductActivityProps {
  variant: Extract<ProductTab, 'tasks' | 'activity'>;
}

const columns = [
  {
    label: 'In Progress',
    dot: 'bg-teal-400',
    tasks: [
      { name: 'Design the task board layout', owner: 'Design', status: 'Due Fri', statusClass: 'text-amber-400' },
      { name: 'Write onboarding checklist', owner: 'PM', status: 'Due Wed', statusClass: 'text-amber-400' },
      { name: 'Build profile settings page', owner: 'Eng', status: '62%', statusClass: 'text-emerald-400' },
    ],
  },
  {
    label: 'In Review',
    dot: 'bg-lime-400',
    tasks: [
      { name: 'Review the project roadmap', owner: 'Ops', status: '2 comments', statusClass: 'text-emerald-400' },
      { name: 'Audit permissions for members', owner: 'Eng', status: '1 comment', statusClass: 'text-emerald-400' },
    ],
  },
  {
    label: 'Done',
    dot: 'bg-emerald-400',
    tasks: [
      { name: 'Set up the workspace', owner: 'Team', status: 'Completed', statusClass: 'text-emerald-400' },
      { name: 'Define task status labels', owner: 'Design', status: 'Completed', statusClass: 'text-emerald-400' },
    ],
  },
];

const activity = [
  {
    icon: MessageSquare,
    color: 'text-emerald-400 bg-emerald-500/15',
    text: (
      <>
        <strong className="font-semibold text-[var(--text-primary)]">Design</strong> moved{' '}
        <span className="text-[var(--text-primary)]">‘Design the task board layout’</span> to In Progress
      </>
    ),
    time: 'just now',
  },
  {
    icon: MessageSquare,
    color: 'text-teal-400 bg-teal-500/15',
    text: (
      <>
        <strong className="font-semibold text-[var(--text-primary)]">PM</strong> added a comment to{' '}
        <span className="text-[var(--text-primary)]">‘Write onboarding checklist’</span>
      </>
    ),
    time: '12 min ago',
  },
  {
    icon: ShieldCheck,
    color: 'text-lime-400 bg-lime-500/15',
    text: (
      <>
        <strong className="font-semibold text-[var(--text-primary)]">Eng</strong> completed{' '}
        <span className="text-[var(--text-primary)]">‘Audit permissions for members’</span>
      </>
    ),
    time: '1 hr ago',
  },
  {
    icon: UserPlus,
    color: 'text-teal-400 bg-teal-500/15',
    text: (
      <>
        <strong className="font-semibold text-[var(--text-primary)]">A new member</strong> joined the
        NOVA Workspace
      </>
    ),
    time: '2 hrs ago',
  },
];

export const ProductActivity: React.FC<ProductActivityProps> = ({ variant }) => {
  if (variant === 'tasks') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Product Workspace</h4>
            <p className="text-xs text-[var(--text-muted)]">12 open tasks · 4 projects</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Updated just now</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {columns.map((col) => (
            <div
              key={col.label}
              className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border-color)] space-y-2.5"
            >
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                <span>{col.label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              </div>
              {col.tasks.map((task) => (
                <div
                  key={task.name}
                  className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      {task.name}
                    </div>
                    <MoreHorizontal className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1.5">
                    <span>{task.owner}</span>
                    <span className={task.statusClass}>{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Recent activity</h4>
          <p className="text-xs text-[var(--text-muted)]">Everything that changed in your workspace</p>
        </div>
      </div>

      <div className="space-y-2">
        {activity.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-2.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-color)] flex items-center gap-2.5"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-[var(--text-secondary)] leading-snug min-w-0 flex-1">
                {item.text}
              </div>
              <span className="text-[10px] text-neutral-500 flex-shrink-0">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};