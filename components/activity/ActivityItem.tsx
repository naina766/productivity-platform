'use client';

import { motion } from 'framer-motion';
import {
  Rocket,
  PlusCircle,
  UserPlus,
  UserMinus,
  ArrowLeftRight,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { relativeTimeFrom } from '@/lib/format';
import type { ActivityItem as ActivityItemType } from '@/types/activity';

const ICON_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; ring: string; iconClass: string }
> = {
  PROJECT_CREATED: { icon: Rocket, ring: 'border-emerald-500/25 bg-emerald-500/10', iconClass: 'text-emerald-400' },
  TASK_CREATED: { icon: PlusCircle, ring: 'border-teal-500/25 bg-teal-500/10', iconClass: 'text-teal-400' },
  TASK_ASSIGNED: { icon: UserPlus, ring: 'border-lime-500/25 bg-lime-500/10', iconClass: 'text-lime-400' },
  MEMBER_ADDED: { icon: UserPlus, ring: 'border-lime-500/25 bg-lime-500/10', iconClass: 'text-lime-400' },
  MEMBER_REMOVED: { icon: UserMinus, ring: 'border-neutral-500/25 bg-neutral-500/10', iconClass: 'text-neutral-400' },
  TASK_STATUS_CHANGED: { icon: ArrowLeftRight, ring: 'border-emerald-500/25 bg-emerald-500/10', iconClass: 'text-emerald-400' },
  TASK_COMPLETED: { icon: CheckCircle2, ring: 'border-teal-500/25 bg-teal-500/10', iconClass: 'text-teal-400' },
  COMMENT_ADDED: { icon: MessageSquare, ring: 'border-neutral-400/25 bg-neutral-400/10', iconClass: 'text-neutral-400' },
};

interface ActivityItemProps {
  activity: ActivityItemType;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = ICON_CONFIG[activity.type] ?? ICON_CONFIG.TASK_STATUS_CHANGED;
  const Icon = config.icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* Timeline node */}
      <div className="flex flex-col items-center shrink-0">
        <span
          className={`w-8 h-8 rounded-full border flex items-center justify-center ${config.ring}`}
          aria-hidden="true"
        >
          <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
        </span>
      </div>

      <div className="flex-1 min-w-0 pb-5">
        <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
          {activity.actor && (
            <span className="font-semibold text-[var(--text-primary)]">
              {activity.actor.name}
            </span>
          )}{' '}
          {activity.message}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5" title={new Date(activity.createdAt).toLocaleString()}>
          {relativeTimeFrom(activity.createdAt)}
        </p>
      </div>
    </motion.li>
  );
}