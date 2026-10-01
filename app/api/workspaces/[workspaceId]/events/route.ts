import { type NextRequest } from 'next/server';
import crypto from 'crypto';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { eventBus, formatSSEMessage } from '@/lib/realtime/event-bus';

export const dynamic = 'force-dynamic';

async function resolveUserFromRequest(req: NextRequest) {
  let token: string | null = null;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = req.nextUrl.searchParams.get('token');
  }

  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') return null;

    return await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  const user = await resolveUserFromRequest(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Enforce strict workspace isolation
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    return new Response(
      JSON.stringify({ error: 'Forbidden', message: 'Access to workspace denied' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connect greeting
      const initEvent = formatSSEMessage({
        id: crypto.randomUUID(),
        type: 'HEARTBEAT',
        workspaceId,
        data: { connected: true, userId: user.id },
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(initEvent));

      // Subscribe to events scoped strictly to this workspace
      const unsubscribe = eventBus.subscribe(workspaceId, (event) => {
        try {
          controller.enqueue(encoder.encode(formatSSEMessage(event)));
        } catch {
          // Controller might be closed
        }
      });

      // Keepalive heartbeat ping every 25 seconds
      const timer = setInterval(() => {
        try {
          const ping = formatSSEMessage({
            id: crypto.randomUUID(),
            type: 'HEARTBEAT',
            workspaceId,
            data: { time: Date.now() },
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(ping));
        } catch {
          clearInterval(timer);
        }
      }, 25000);

      cleanup = () => {
        clearInterval(timer);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      req.signal.addEventListener('abort', () => {
        if (cleanup) {
          cleanup();
          cleanup = null;
        }
      });
    },
    cancel() {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
