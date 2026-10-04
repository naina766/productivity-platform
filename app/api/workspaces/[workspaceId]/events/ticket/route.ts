import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { createSSETicket } from '@/lib/realtime/sse-tickets';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  // 1. Authenticate user from session / Authorization Bearer header
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. Strict workspace isolation: verify membership
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Access to workspace denied' },
      { status: 403 }
    );
  }

  // 3. Issue short-lived, single-use, workspace-scoped SSE ticket
  const { ticket, expiresIn } = createSSETicket(user.id, workspaceId);

  return NextResponse.json({
    success: true,
    ticket,
    expiresIn,
  });
}
