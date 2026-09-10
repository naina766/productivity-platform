'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { apiGetNotifications } from '@/lib/api/client';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { useAuth } from '@/components/auth/AuthContext';

interface NotificationBellProps {
  className?: string;
}

/**
 * Notification bell with unread badge. Fetches the unread count once on
 * mount (the panel refetches the full list whenever it opens) and updates
 * immediately after read / mark-all-read interactions.
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiGetNotifications({ limit: 1 });
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Notifications are non-critical — fail silently.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) void fetchCount();
  }, [isAuthenticated, fetchCount]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!isAuthenticated) return null;

  return (
    <div ref={rootRef} className={`relative inline-flex items-center ${className ?? ''}`}>
      <button
        type="button"
        id="notification-bell"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-main)] border border-transparent hover:border-[var(--border-color)] transition-all"
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-emerald-500/30"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationPanel open={open} onCountChange={setUnreadCount} />
    </div>
  );
}