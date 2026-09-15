'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  Users,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  Zap,
} from 'lucide-react';
import type { ProjectSummary, ProjectStatus, ProjectPriority } from '@/types/project';

// ─── Status / priority display maps ──────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  PLANNING: {
    label: 'Planning',
    icon: <Clock className="w-3 h-3" />,
    className: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
  },
  ACTIVE: {
    label: 'Active',
    icon: <Zap className="w-3 h-3" />,
    className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  ON_HOLD: {
    label: 'On Hold',
    icon: <PauseCircle className="w-3 h-3" />,
    className: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  COMPLETED: {
    label: 'Completed',
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  },
  ARCHIVED: {
    label: 'Archived',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20',
  },
};

const PRIORITY_DOT: Record<ProjectPriority, string> = {
  LOW: 'bg-neutral-400',
  MEDIUM: 'bg-lime-400',
  HIGH: 'bg-amber-400',
  URGENT: 'bg-red-400',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: ProjectSummary;
  index?: number;
}

function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return new Date(dueDate).getTime() < Date.now() + SEVEN_DAYS_MS;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.ACTIVE;
  const priorityDot = PRIORITY_DOT[project.priority] ?? 'bg-neutral-400';

  const dueSoon = isDueSoon(project.dueDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200"
      >
        {/* Top row: status badge + priority dot */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.className}`}
          >
            {status.icon}
            {status.label}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${priorityDot}`} aria-hidden="true" />
            <span className="text-xs text-[var(--text-muted)]">
              {project.priority.charAt(0) + project.priority.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {project.name}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Footer: members + due date + arrow */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
            </span>
            {project.dueDate && (
              <span
                className={`flex items-center gap-1.5 ${dueSoon ? 'text-amber-400' : ''}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {new Date(project.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}
