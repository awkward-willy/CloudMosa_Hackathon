import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'access_token';

// 1. Specify protected and public routes
// Only protect /about (and its subroutes) for now. Root should remain public for landing.
const protectedPrefixes = ['/expenseTracker', '/financialAnalysis', '/investmentCalculator', '/'];
const publicRoutes = ['/login', '/signup'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/$/, '') || '/';
  const isProtectedRoute = protectedPrefixes.some((p) => path === p || path.startsWith(p + '/'));
  const isPublicRoute = publicRoutes.includes(path);

  const cookieStore = await cookies();
  const hasToken = !!cookieStore.get(ACCESS_COOKIE)?.value;

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 5. Redirect to / if the user is authenticated visiting a public auth page
  if (isPublicRoute && hasToken) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

