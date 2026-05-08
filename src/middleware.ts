import { NextRequest, NextResponse } from "next/server";

// ─── Route definitions ────────────────────────────────────────────────────────

/**
 * Routes that require a valid auth token.
 * Any path that *starts with* one of these prefixes is protected.
 */
const PROTECTED_PREFIXES = ["/admin", "/guests", "/organizer", "/select-role"];

/**
 * Routes that should redirect authenticated users away
 * (e.g. don't show the login page to someone already signed in).
 */
const AUTH_ROUTES = ["/auth"];

/** Where unauthenticated users are sent. */
const SIGN_IN_URL = "/auth";

/** Default destination after sign-in (fallback when no role-specific path). */
const DEFAULT_AUTHENTICATED_URL = "/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the mirrored JWT cookie (written by ApiClient on login).
  const token = request.cookies.get("auth_token")?.value ?? null;
  const isAuthenticated = Boolean(token);

  // 1. Unauthenticated user hitting a protected route → redirect to sign-in.
  if (!isAuthenticated && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = SIGN_IN_URL;
    // Preserve the original destination so we can redirect back after login.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated user hitting the auth/login page → redirect to dashboard.
  if (isAuthenticated && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_URL;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3. Everything else — pass through.
  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  /*
   * Run on all routes except:
   *   - Next.js internals (_next/static, _next/image)
   *   - Static assets (favicon, images, fonts, etc.)
   *   - API routes handled by the Express backend
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)).*)",
  ],
};
