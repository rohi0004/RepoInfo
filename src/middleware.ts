import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware: normalize encoded slashes in the pathname early in the request
// lifecycle. Example problem URL:
//   /rohi0004%2FStickyStream
// The router may treat that as a single segment (`owner`) so dynamic
// `[owner]/[repo]` routes don't match. Decode `%2F` to `/` and redirect
// to the canonical `/owner/repo` path.

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Fast-path: only operate when encoded slash appears in the raw pathname.
  if (pathname.includes('%2F') || pathname.includes('%2f')) {
    try {
      const decoded = decodeURIComponent(pathname);
      // Safety: avoid loops — redirect only if decoded differs.
      if (decoded !== pathname) {
        url.pathname = decoded;
        return NextResponse.redirect(url, 308);
      }
    } catch (e) {
      // If decode fails for any reason, continue without redirecting.
      // This is best-effort normalization.
    }
  }

  return NextResponse.next();
}

// Run this middleware for all paths so encoded segments are normalized globally.
export const config = {
  matcher: '/:path*',
};
