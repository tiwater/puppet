import type { NextRequest } from 'next/server';
import pb from './utils/pocketbase';
import { NextResponse } from 'next/server';
import { pathToRegexp } from 'path-to-regexp';

const loadAuthFromRequestCookie = (request: NextRequest) => {
  const authValue = request.cookies.get('pb_auth')?.value;
  pb.authStore.loadFromCookie(['pb_auth', authValue].join('='));
  return pb;
};

const publicPathRegexp = pathToRegexp([
  '/:locale?/auth/(.*)', // /auth/*
]);

export const testPublicPath = (p: string) => publicPathRegexp.test(p);

export async function middleware(request: NextRequest) {
  // Redirect to login if not authenticated
  if (!testPublicPath(request.nextUrl.pathname)) {
    loadAuthFromRequestCookie(request);
    if (!pb.authStore.isValid) {
      const redirectTo = `${process.env.NEXT_PUBLIC_PUPPET_SERVER_URL}${request.nextUrl.pathname}`;
      console.log(`redirectTo: ${redirectTo}`);
      const encodedRedirectTo = encodeURIComponent(redirectTo);
      const redirectPath = `${process.env.NEXT_PUBLIC_PENLESS_SERVER_URL}/auth/login?redirect=${encodedRedirectTo}`;
      console.log(`Full request path: ${redirectPath}`);
      return NextResponse.redirect(new URL(redirectPath));
    }
  }

  // Continue processing the request
  return NextResponse.next();
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\.(?:png|ico|svg|jpeg|jpg|webp|md|cer)).*)'], // Matcher ignoring `/_next/`, `/api/` and `/docs/`
};