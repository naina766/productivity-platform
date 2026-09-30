/**
 * NOVA Prisma seed — local development / demo data only.
 * Run: npm run db:seed  (requires DATABASE_URL + migrated DB)
 *
 * Demo credentials (safe for README):
 *   owner@nova.demo / NovaDemo123!
 *   admin@nova.demo / NovaDemo123!
 *   member@nova.demo / NovaDemo123!
 */
import { PrismaClient, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('NovaDemo123!', 12);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@nova.demo' },
    update: { passwordHash, name: 'Nova Owner' },
    create: { email: 'owner@nova.demo', name: 'Nova Owner', passwordHash },
  });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nova.demo' },
    update: { passwordHash, name: 'Nova Admin' },
    create: { email: 'admin@nova.demo', name: 'Nova Admin', passwordHash },
  });
  const member = await prisma.user.upsert({
    where: { email: 'member@nova.demo' },
    update: { passwordHash, name: 'Nova Member' },
    create: { email: 'member@nova.demo', name: 'Nova Member', passwordHash },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'nova-demo' },
    update: { name: 'NOVA Demo Workspace', description: 'Seeded demo workspace for local development.' },
    create: {
      name: 'NOVA Demo Workspace',
      slug: 'nova-demo',
      description: 'Seeded demo workspace for local development.',
      ownerId: owner.id,
    },
  });

  for (const [userId, role] of [
    [owner.id, 'OWNER'],
    [admin.id, 'ADMIN'],
    [member.id, 'MEMBER'],
  ] as const) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
      update: { role },
      create: { workspaceId: workspace.id, userId, role },
    });
  }

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {
      name: 'Website relaunch',
      description: 'Seeded demo project: plan, build, and ship the new site.',
      status: 'ACTIVE',
      priority: 'HIGH',
    },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      workspaceId: workspace.id,
      name: 'Website relaunch',
      description: 'Seeded demo project: plan, build, and ship the new site.',
      status: 'ACTIVE',
      priority: 'HIGH',
    },
  });

  for (const userId of [owner.id, admin.id, member.id]) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId } },
      update: {},
      create: { projectId: project.id, userId },
    });
  }

  const seedTasks = [
    { id: '00000000-0000-4000-8000-000000000011', title: 'Draft sitemap', status: TaskStatus.TODO, assigneeId: member.id },
    { id: '00000000-0000-4000-8000-000000000012', title: 'Design landing page', status: TaskStatus.IN_PROGRESS, assigneeId: admin.id },
    { id: '00000000-0000-4000-8000-000000000013', title: 'Review copy', status: TaskStatus.IN_REVIEW, assigneeId: owner.id },
    { id: '00000000-0000-4000-8000-000000000014', title: 'Set up analytics', status: TaskStatus.DONE, assigneeId: member.id },
  ];
  for (const [i, t] of seedTasks.entries()) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: { title: t.title, status: t.status, assigneeId: t.assigneeId, position: i },
      create: { id: t.id, projectId: project.id, title: t.title, status: t.status, assigneeId: t.assigneeId, position: i },
    });
  }

  // Seed deterministic labels
  const designLabel = await prisma.label.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Design' } },
    update: { color: '#22C55E' },
    create: { workspaceId: workspace.id, name: 'Design', color: '#22C55E' },
  });

  const frontendLabel = await prisma.label.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Frontend' } },
    update: { color: '#14B8A6' },
    create: { workspaceId: workspace.id, name: 'Frontend', color: '#14B8A6' },
  });

  // Attach label to task
  await prisma.taskLabel.upsert({
    where: { taskId_labelId: { taskId: seedTasks[1].id, labelId: designLabel.id } },
    update: {},
    create: { taskId: seedTasks[1].id, labelId: designLabel.id },
  });

  await prisma.taskLabel.upsert({
    where: { taskId_labelId: { taskId: seedTasks[1].id, labelId: frontendLabel.id } },
    update: {},
    create: { taskId: seedTasks[1].id, labelId: frontendLabel.id },
  });

  // Seed deterministic comment
  await prisma.taskComment.upsert({
    where: { id: '00000000-0000-4000-8000-000000000021' },
    update: { body: 'Hero section mockups are approved. Moving to prototyping.' },
    create: {
      id: '00000000-0000-4000-8000-000000000021',
      taskId: seedTasks[1].id,
      authorId: owner.id,
      body: 'Hero section mockups are approved. Moving to prototyping.',
    },
  });

  // Seed deterministic activity
  await prisma.activity.upsert({
    where: { id: '00000000-0000-4000-8000-000000000031' },
    update: { message: 'Nova Owner assigned task "Design landing page" to Nova Admin' },
    create: {
      id: '00000000-0000-4000-8000-000000000031',
      projectId: project.id,
      taskId: seedTasks[1].id,
      actorId: owner.id,
      type: 'TASK_ASSIGNED',
      message: 'Nova Owner assigned task "Design landing page" to Nova Admin',
    },
  });

  // Seed deterministic notification
  await prisma.notification.upsert({
    where: { id: '00000000-0000-4000-8000-000000000041' },
    update: { title: 'You were assigned to "Design landing page"' },
    create: {
      id: '00000000-0000-4000-8000-000000000041',
      userId: admin.id,
      taskId: seedTasks[1].id,
      title: 'You were assigned to "Design landing page"',
      body: 'Nova Owner assigned this task to you in Website relaunch.',
    },
  });

  // eslint-disable-next-line no-console
  console.log('[seed] done: 3 users, 1 workspace, 1 project, 4 tasks, labels, comments, activity & notification seeded idempotently');
}

await main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[seed] failed', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
