import { NextRequest, NextResponse } from 'next/server';

/**
 * NOVA route protection proxy.
 *
 * Runs in the Edge runtime — cannot use Node.js-only APIs (jsonwebtoken, Prisma, etc.).
 * We use the refresh_token cookie as a coarse presence check:
 *   - Cookie absent → not authenticated → redirect /login for protected routes
 *   - Cookie present → may be authenticated → let the page/route handler do real JWT verification
 *
 * The actual JWT verification happens in:
 *   - GET /api/auth/me (via getCurrentUser)
 *   - The AuthContext loadUser flow on the client
 */

const PROTECTED_PATHS = ['/dashboard', '/projects', '/my-tasks', '/calendar', '/tasks'];

const AUTH_PATHS = ['/login', '/register'];

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const hasRefreshCookie = req.cookies.has('refresh_token');

  // Protect authenticated routes
  if (PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!hasRefreshCookie) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from /login and /register
  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (hasRefreshCookie) {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.search = '';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js static files)
     * - _next/image  (Next.js image optimisation)
     * - favicon.svg  (favicon)
     * - api/*        (API routes handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon\\.svg|api/).*)',
  ],
};
