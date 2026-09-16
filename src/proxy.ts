import { NextRequest, NextResponse } from "next/server";

// Password recovery must be reachable without a session - a reset page behind
// the login wall is useless to someone who cannot log in.
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/forgot-password",
  "/reset-password",
];

// BetterAuth sets one of these depending on whether secure cookies are enabled
const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
