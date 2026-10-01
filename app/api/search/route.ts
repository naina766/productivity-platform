import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { buildErrorResponse, AppError } from '@/lib/errors';
import { globalSearch } from '@/lib/search/search.service';
import type { SearchCategory } from '@/types/search';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const workspaceId = searchParams.get('workspaceId') ?? undefined;
    const categoryParam = searchParams.get('category') as SearchCategory | null;
    const limitParam = Number(searchParams.get('limit') ?? '10');

    const validCategories: SearchCategory[] = ['all', 'tasks', 'projects', 'milestones', 'members'];
    const category = categoryParam && validCategories.includes(categoryParam) ? categoryParam : 'all';
    const limit = Number.isFinite(limitParam) ? limitParam : 10;

    const results = await globalSearch(user.id, q, {
      workspaceId,
      category,
      limit,
    });

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    const body = buildErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}
