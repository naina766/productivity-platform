import { EventEmitter } from 'events';
import crypto from 'crypto';
import type { RealtimeEvent, RealtimeEventType } from '@/types/realtime';

class WorkspaceEventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    // Allow multiple concurrent workspace client connections without Node warning
    this.emitter.setMaxListeners(500);
  }

  private channelKey(workspaceId: string): string {
    return `workspace:${workspaceId}`;
  }

  /**
   * Publishes an event to all subscribers connected to the given workspace.
   */
  public publish<T>(
    workspaceId: string,
    event: {
      type: RealtimeEventType;
      projectId?: string;
      actorId?: string;
      data: T;
    }
  ): RealtimeEvent<T> {
    const fullEvent: RealtimeEvent<T> = {
      id: crypto.randomUUID(),
      type: event.type,
      workspaceId,
      projectId: event.projectId,
      actorId: event.actorId,
      data: event.data,
      timestamp: new Date().toISOString(),
    };

    this.emitter.emit(this.channelKey(workspaceId), fullEvent);
    return fullEvent;
  }

  /**
   * Subscribes to events for a specific workspace.
   * Returns an unsubscribe function.
   */
  public subscribe(
    workspaceId: string,
    listener: (event: RealtimeEvent) => void
  ): () => void {
    const channel = this.channelKey(workspaceId);
    this.emitter.on(channel, listener);

    return () => {
      this.emitter.off(channel, listener);
    };
  }

  /**
   * Helper to count active listeners on a workspace channel.
   */
  public getListenerCount(workspaceId: string): number {
    return this.emitter.listenerCount(this.channelKey(workspaceId));
  }
}

// Preserve bus across hot reloads in development
const globalForRealtime = globalThis as unknown as {
  workspaceEventBus?: WorkspaceEventBus;
};

export const eventBus =
  globalForRealtime.workspaceEventBus ?? new WorkspaceEventBus();

if (process.env.NODE_ENV !== 'production') {
  globalForRealtime.workspaceEventBus = eventBus;
}

/**
 * Format a RealtimeEvent into standard Server-Sent Events (SSE) wire string.
 */
export function formatSSEMessage(event: RealtimeEvent): string {
  const data = JSON.stringify(event);
  return `id: ${event.id}\nevent: ${event.type}\ndata: ${data}\n\n`;
}
