import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { createSavedViewSchema } from '@/lib/validations/saved-view';
import {
  listSavedViews,
  createSavedView,
} from '@/lib/saved-views/saved-view.service';

/**
 * GET /api/workspaces/[workspaceId]/saved-views
 * List saved views for a workspace (and optional projectId).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const projectId = req.nextUrl.searchParams.get('projectId') || undefined;
    const views = await listSavedViews(workspaceId, user.id, projectId);
    return NextResponse.json({ success: true, data: views });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/workspaces/[workspaceId]/saved-views
 * Create a new saved view in a workspace.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = createSavedViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid input.' },
        { status: 422 }
      );
    }

    const view = await createSavedView(workspaceId, user.id, parsed.data);
    return NextResponse.json({ success: true, data: view }, { status: 201 });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
