import React from 'react';
import { Clock, CheckCircle2, Layers, AlertTriangle } from 'lucide-react';

const stats = [
  {
    label: 'Open Tasks',
    value: '12',
    sub: 'across 4 projects',
    icon: Clock,
    iconClass: 'text-[var(--accent-primary)]',
    barClass: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    width: 'w-[63%]',
  },
  {
    label: 'Done This Week',
    value: '28',
    sub: '+6 today',
    icon: CheckCircle2,
    iconClass: 'text-lime-400',
    barClass: 'bg-gradient-to-r from-lime-400 to-emerald-500',
    width: 'w-[70%]',
  },
  {
    label: 'Active Projects',
    value: '4',
    sub: '1 workspace',
    icon: Layers,
    iconClass: 'text-[var(--accent-teal)]',
    barClass: 'bg-gradient-to-r from-teal-400 to-emerald-400',
    width: 'w-[40%]',
  },
  {
    label: 'Overdue',
    value: '1',
    sub: 'due yesterday',
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
    barClass: 'bg-gradient-to-r from-amber-400 to-emerald-400',
    width: 'w-[12%]',
  },
];

const projects = [
  { name: 'Marketing Site', done: 78, color: 'bg-emerald-500' },
  { name: 'Mobile App', done: 45, color: 'bg-teal-400' },
  { name: 'API Platform', done: 62, color: 'bg-lime-400' },
  { name: 'Design System', done: 91, color: 'bg-emerald-600' },
];

export const ProductMetrics: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Today · All projects</p>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Good morning 👋</h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
          2 projects on track
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border-color)]"
            >
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1">
                <span>{stat.label}</span>
                <Icon className={`w-3.5 h-3.5 ${stat.iconClass}`} />
              </div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {stat.value}{' '}
                <span className={`text-xs font-normal ${stat.iconClass}`}>{stat.sub}</span>
              </div>
              <div className="w-full bg-[var(--border-color)] rounded-full h-1.5 mt-2">
                <div className={`${stat.barClass} h-1.5 rounded-full ${stat.width}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[var(--card-elevated)] border border-[var(--border-color)] space-y-3">
        <div className="text-xs font-semibold text-[var(--text-primary)]">Project progress</div>
        {projects.map((project) => (
          <div key={project.name} className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-secondary)] w-28 flex-shrink-0 truncate">
              {project.name}
            </span>
            <div className="flex-1 bg-[var(--border-color)] rounded-full h-1.5">
              <div
                className={`${project.color} h-1.5 rounded-full`}
                style={{ width: `${project.done}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-muted)] w-8 text-right">
              {project.done}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};