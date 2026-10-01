import { eventBus, formatSSEMessage } from '@/lib/realtime/event-bus';
import type { RealtimeEvent } from '@/types/realtime';

describe('Realtime Collaboration & Workspace Event Bus', () => {
  const workspaceA = 'ws-alpha-1111';
  const workspaceB = 'ws-beta-2222';

  it('delivers events to subscribers on the matching workspace channel', () => {
    const received: RealtimeEvent[] = [];
    const unsubscribe = eventBus.subscribe(workspaceA, (e) => {
      received.push(e);
    });

    const published = eventBus.publish(workspaceA, {
      type: 'TASK_CREATED',
      projectId: 'proj-1',
      actorId: 'user-1',
      data: { id: 'task-100', title: 'Realtime task' },
    });

    expect(received).toHaveLength(1);
    expect(received[0].id).toBe(published.id);
    expect(received[0].type).toBe('TASK_CREATED');
    expect(received[0].workspaceId).toBe(workspaceA);
    expect(received[0].projectId).toBe('proj-1');
    expect(received[0].actorId).toBe('user-1');
    expect(received[0].data).toEqual({ id: 'task-100', title: 'Realtime task' });
    expect(received[0].timestamp).toBeDefined();

    unsubscribe();
  });

  it('guarantees workspace isolation (workspace A subscriber never receives workspace B events)', () => {
    const receivedA: RealtimeEvent[] = [];
    const receivedB: RealtimeEvent[] = [];

    const unsubscribeA = eventBus.subscribe(workspaceA, (e) => {
      receivedA.push(e);
    });
    const unsubscribeB = eventBus.subscribe(workspaceB, (e) => {
      receivedB.push(e);
    });

    // Publish to workspace B
    eventBus.publish(workspaceB, {
      type: 'COMMENT_CREATED',
      projectId: 'proj-b',
      actorId: 'user-b',
      data: { commentId: 'comm-1', text: 'Confidential B comment' },
    });

    expect(receivedB).toHaveLength(1);
    expect(receivedA).toHaveLength(0); // Strict isolation verified

    // Publish to workspace A
    eventBus.publish(workspaceA, {
      type: 'TASK_UPDATED',
      projectId: 'proj-a',
      actorId: 'user-a',
      data: { id: 'task-a', status: 'DONE' },
    });

    expect(receivedA).toHaveLength(1);
    expect(receivedB).toHaveLength(1); // Unchanged

    unsubscribeA();
    unsubscribeB();
  });

  it('stops delivering events after unsubscribe function is called', () => {
    const received: RealtimeEvent[] = [];
    const unsubscribe = eventBus.subscribe(workspaceA, (e) => {
      received.push(e);
    });

    eventBus.publish(workspaceA, {
      type: 'TASK_CREATED',
      data: { count: 1 },
    });
    expect(received).toHaveLength(1);

    unsubscribe();

    eventBus.publish(workspaceA, {
      type: 'TASK_CREATED',
      data: { count: 2 },
    });
    expect(received).toHaveLength(1); // Did not receive second event
  });

  it('supports multiple concurrent subscribers per workspace', () => {
    const sub1Events: RealtimeEvent[] = [];
    const sub2Events: RealtimeEvent[] = [];

    const unsub1 = eventBus.subscribe(workspaceA, (e) => sub1Events.push(e));
    const unsub2 = eventBus.subscribe(workspaceA, (e) => sub2Events.push(e));

    eventBus.publish(workspaceA, {
      type: 'PROJECT_UPDATED',
      data: { name: 'Alpha Redesign' },
    });

    expect(sub1Events).toHaveLength(1);
    expect(sub2Events).toHaveLength(1);
    expect(sub1Events[0].id).toBe(sub2Events[0].id);

    unsub1();
    unsub2();
  });

  it('correctly formats events into standard SSE wire messages', () => {
    const event: RealtimeEvent = {
      id: 'evt-12345',
      type: 'TASK_CREATED',
      workspaceId: 'ws-1',
      actorId: 'user-1',
      projectId: 'proj-1',
      data: { test: true },
      timestamp: '2026-10-02T00:00:00.000Z',
    };

    const sse = formatSSEMessage(event);

    expect(sse).toContain('id: evt-12345\n');
    expect(sse).toContain('event: TASK_CREATED\n');
    expect(sse).toContain('data: {"id":"evt-12345","type":"TASK_CREATED"');
    expect(sse.endsWith('\n\n')).toBe(true);
  });

  it('publishes and delivers NOTIFICATION_CREATED events scoped to the workspace', () => {
    const received: RealtimeEvent[] = [];
    const unsubscribe = eventBus.subscribe(workspaceA, (e) => {
      if (e.type === 'NOTIFICATION_CREATED') {
        received.push(e);
      }
    });

    eventBus.publish(workspaceA, {
      type: 'NOTIFICATION_CREATED',
      projectId: 'proj-1',
      actorId: 'user-actor',
      data: { userId: 'user-recipient', title: 'Task assigned' },
    });

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('NOTIFICATION_CREATED');
    expect(received[0].actorId).toBe('user-actor');
    expect(received[0].data).toEqual({ userId: 'user-recipient', title: 'Task assigned' });

    unsubscribe();
  });

  it('publishes and delivers COMMENT_CREATED and COMMENT_DELETED events', () => {
    const received: RealtimeEvent[] = [];
    const unsubscribe = eventBus.subscribe(workspaceA, (e) => {
      received.push(e);
    });

    eventBus.publish(workspaceA, {
      type: 'COMMENT_CREATED',
      projectId: 'proj-1',
      actorId: 'user-1',
      data: { taskId: 'task-1', comment: { id: 'c-1', body: 'Looks good' } },
    });

    eventBus.publish(workspaceA, {
      type: 'COMMENT_DELETED',
      projectId: 'proj-1',
      actorId: 'user-1',
      data: { taskId: 'task-1', commentId: 'c-1' },
    });

    expect(received).toHaveLength(2);
    expect(received[0].type).toBe('COMMENT_CREATED');
    expect(received[1].type).toBe('COMMENT_DELETED');

    unsubscribe();
  });
});
