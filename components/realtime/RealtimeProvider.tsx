'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAccessToken } from '@/lib/api/client';
import type { RealtimeEvent, RealtimeEventType } from '@/types/realtime';

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected';

interface RealtimeContextValue {
  status: RealtimeStatus;
  lastEvent: RealtimeEvent | null;
  subscribe: (
    type: RealtimeEventType | '*',
    handler: (event: RealtimeEvent) => void
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  status: 'disconnected',
  lastEvent: null,
  subscribe: () => () => {},
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, workspace, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  const listenersRef = useRef<
    Map<string, Set<(event: RealtimeEvent) => void>>
  >(new Map());

  const subscribe = useCallback(
    (
      type: RealtimeEventType | '*',
      handler: (event: RealtimeEvent) => void
    ) => {
      const listeners = listenersRef.current;
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)!.add(handler);

      return () => {
        const set = listeners.get(type);
        if (set) {
          set.delete(handler);
          if (set.size === 0) {
            listeners.delete(type);
          }
        }
      };
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated || !workspace?.id || !user) {
      setStatus('disconnected');
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let attempts = 0;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      const token = getAccessToken();
      const url = token
        ? `/api/workspaces/${workspace.id}/events?token=${encodeURIComponent(token)}`
        : `/api/workspaces/${workspace.id}/events`;

      setStatus('connecting');
      eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onopen = () => {
        if (isDisposed) return;
        setStatus('connected');
        attempts = 0;
      };

      const handleEvent = (e: MessageEvent) => {
        if (isDisposed) return;
        try {
          const parsed = JSON.parse(e.data) as RealtimeEvent;
          setLastEvent(parsed);

          // Dispatch to specific listeners and wildcard listeners
          const specific = listenersRef.current.get(parsed.type);
          specific?.forEach((fn) => fn(parsed));

          const wildcards = listenersRef.current.get('*');
          wildcards?.forEach((fn) => fn(parsed));
        } catch {
          // Ignore parse errors on malformed messages
        }
      };

      // Listen to standard SSE events
      eventSource.onmessage = handleEvent;

      const eventTypes: RealtimeEventType[] = [
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_DELETED',
        'COMMENT_CREATED',
        'COMMENT_DELETED',
        'NOTIFICATION_CREATED',
        'PROJECT_UPDATED',
        'HEARTBEAT',
      ];

      eventTypes.forEach((type) => {
        eventSource?.addEventListener(type, handleEvent);
      });

      eventSource.onerror = () => {
        if (isDisposed) return;
        setStatus('disconnected');
        eventSource?.close();

        // Exponential backoff reconnect: 2s, 4s, 8s, up to 16s max
        attempts++;
        const delay = Math.min(1000 * Math.pow(2, attempts), 16000);
        reconnectTimeout = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, workspace?.id, user]);

  return (
    <RealtimeContext.Provider value={{ status, lastEvent, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to consume realtime status and events.
 */
export function useRealtime() {
  return useContext(RealtimeContext);
}

/**
 * Hook to subscribe to a specific realtime event type.
 */
export function useRealtimeSubscription(
  type: RealtimeEventType | '*',
  handler: (event: RealtimeEvent) => void
) {
  const { subscribe } = useRealtime();

  useEffect(() => {
    return subscribe(type, handler);
  }, [type, handler, subscribe]);
}
