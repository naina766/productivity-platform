'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Loader2, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { apiGetProjectActivity } from '@/lib/api/client';
import { ActivityItem as ActivityItemView } from '@/components/activity/ActivityItem';
import type { ActivityItem as ActivityItemType } from '@/types/activity';

interface ActivityTimelineProps {
  projectId: string;
  taskId?: string;
  limit?: number;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDay = new Date(d);
  startOfDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((startOfToday.getTime() - startOfDay.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ActivityTimeline({ projectId, taskId, limit }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetProjectActivity(projectId, { taskId, limit });
      setActivities(res.data.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, [projectId, taskId, limit]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  const groups = useMemo(() => {
    const map = new Map<string, ActivityItemType[]>();
    for (const item of activities) {
      const key = dayKey(item.createdAt);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [activities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
        <button
          type="button"
          onClick={() => void fetchActivity()}
          className="ml-auto inline-flex items-center gap-1 underline hover:no-underline"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--card-elevated)] border border-[var(--border-color)] flex items-center justify-center mb-2">
          <Activity className="w-4 h-4 text-[var(--text-muted)]" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          No activity yet
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Changes to tasks and comments will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([label, items], idx) => (
        <div key={label}>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {label}
            </p>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="ml-4 border-l border-[var(--border-color)] pl-5"
          >
            {items.map((activity, i) => (
              <ActivityItemView key={`${label}-${idx}-${i}`} activity={activity} />
            ))}
          </motion.ul>
        </div>
      ))}
    </div>
  );
}