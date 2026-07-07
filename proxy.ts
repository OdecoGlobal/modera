import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const publicPaths = [
  /^\/$/,
  /^\/docs(?:\/.*)?$/,
  /^\/(login|register|signup|forgot-password|reset-password|verify)(?:\/.*)?$/,
];

const protectedPaths = [/^\/dashboard(?:\/.*)?$/];

const isMatch = (pathname: string, patterns: RegExp[]) =>
  patterns.some(pattern => pattern.test(pathname));

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isMatch(pathname, publicPaths)) {
    return NextResponse.next();
  }

  if (!isMatch(pathname, protectedPaths)) {
    return NextResponse.next();
  }

  try {
    const sessionCookie = getSessionCookie(req);

    if (!sessionCookie) {
      const callbackUrl = pathname + req.nextUrl.search;

      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          req.url,
        ),
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
