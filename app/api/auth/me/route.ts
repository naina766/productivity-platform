import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserWorkspace } from '@/lib/auth/auth.service';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  const workspace = await getUserWorkspace(user.id);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    workspace,
  });
}
