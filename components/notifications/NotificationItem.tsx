'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { relativeTimeFrom } from '@/lib/format';
import { apiMarkNotificationRead } from '@/lib/api/client';
import type { NotificationItem as NotificationItemType } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationItemType;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const unread = notification.readAt === null;

  async function handleClick() {
    if (unread) {
      try {
        await apiMarkNotificationRead(notification.id);
        onRead(notification.id);
      } catch {
        // Still navigate — the read state will resync on next fetch.
      }
    }
    if (notification.projectId) {
      const taskParam = notification.taskId ? `?task=${notification.taskId}` : '';
      router.push(`/projects/${notification.projectId}${taskParam}`);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={() => void handleClick()}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full text-left px-4 py-3 transition-colors flex gap-3 ${
        unread
          ? 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.1]'
          : 'hover:bg-[var(--card-elevated)]'
      }`}
      aria-label={`${notification.title}${notification.body ? ` — ${notification.body}` : ''}. ${unread ? 'Unread.' : 'Read.'}`}
    >
      <span
        aria-hidden="true"
        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
          unread
            ? 'border-emerald-500/25 bg-emerald-500/10'
            : 'border-[var(--border-color)] bg-[var(--card-elevated)]'
        }`}
      >
        <Bell className={`w-3.5 h-3.5 ${unread ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`text-[13px] leading-snug block truncate ${
              unread ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'
            }`}
          >
            {notification.title}
          </span>
          {unread && (
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          )}
        </span>
        {notification.body && (
          <span className="block text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
            {notification.body}
          </span>
        )}
        <span className="block text-[11px] text-[var(--text-muted)] mt-1">
          {relativeTimeFrom(notification.createdAt)}
        </span>
      </span>
    </motion.button>
  );
}