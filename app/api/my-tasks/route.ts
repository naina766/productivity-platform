import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, getUserWorkspace } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { serializeTask } from '@/lib/tasks/task.service';




export async function GET(req: NextRequest): Promise<NextResponse<any>> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }
  const workspace = await getUserWorkspace(user.id);
  if (!workspace) {
    return NextResponse.json({ success: false, message: 'Workspace not found.' }, { status: 404 });
  }

  // Map project IDs to names for display.
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true },
  });
  const projectMap = new Map<string, string>();
  projects.forEach(p => projectMap.set(p.id, p.name));

  // Get tasks assigned to the current user.
  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: { select: { label: { select: { id: true, name: true, color: true } } } },
    },
  });

  const data = tasks.map(task => {
    const base = serializeTask(task as any);
    const projectName = projectMap.get(task.projectId) ?? '';
    return { ...base, projectName };
  });

  return NextResponse.json({ success: true, data });
}
