import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createLabelSchema } from '@/lib/validations/label';
import {
  listWorkspaceLabels,
  createWorkspaceLabel,
} from '@/lib/labels/label.service';

/**
 * GET /api/workspaces/[workspaceId]/labels
 * List all labels for a workspace. Requires workspace membership.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const labels = await listWorkspaceLabels(workspaceId, user.id);
    return NextResponse.json({ success: true, data: labels });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/workspaces/[workspaceId]/labels
 * Create a new label in a workspace. Requires OWNER or ADMIN.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = createLabelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 },
      );
    }

    const label = await createWorkspaceLabel(workspaceId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: label }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
