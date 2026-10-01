import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { updateMilestoneSchema } from '@/lib/validations/milestone';
import { updateMilestone, deleteMilestone } from '@/lib/milestones/milestone.service';

type RouteContext = { params: Promise<{ milestoneId: string }> };

/**
 * PATCH /api/milestones/[milestoneId]
 * Update a milestone (title, description, dueDate, status).
 */
export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { milestoneId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const milestone = await updateMilestone(milestoneId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: milestone });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/milestones/[milestoneId]
 * Delete a milestone.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { milestoneId } = await params;
    await deleteMilestone(milestoneId, user.id);
    return NextResponse.json({ success: true, message: 'Milestone deleted.' });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
