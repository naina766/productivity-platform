'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, Loader2, BellOff } from 'lucide-react';
import { apiGetNotifications, apiMarkAllNotificationsRead } from '@/lib/api/client';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import type { NotificationItem as NotificationItemType } from '@/types/notification';

interface NotificationPanelProps {
  open: boolean;
  onCountChange: (unreadCount: number) => void;
}

export function NotificationPanel({ open, onCountChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetNotifications({ limit: 50 });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      onCountChange(res.data.unreadCount);
    } catch {
      // Keep previous state on failure.
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (open) void fetchNotifications();
  }, [open, fetchNotifications]);

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await apiMarkAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => (n.readAt === null ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount(0);
      onCountChange(0);
    } catch {
      // Swallow — user can retry.
    } finally {
      setMarkingAll(false);
    }
  }

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && n.readAt === null ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    const nextCount = Math.max(unreadCount - 1, 0);
    setUnreadCount(nextCount);
    onCountChange(nextCount);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="notification-panel"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-2 top-16 z-50 sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 w-auto sm:w-[360px] max-h-[70vh] overflow-hidden rounded-2xl bg-[var(--card-main)] border border-[var(--border-color)] shadow-2xl shadow-black/30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h2>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={markingAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center px-6"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--card-elevated)] border border-[var(--border-color)] flex items-center justify-center mb-3">
                  <BellOff className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  You&rsquo;re all caught up.
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  No new notifications.
                </p>
              </motion.div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}