import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "expenseflow_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_expenseflow_foundation_secret_key_32_chars";
  return new TextEncoder().encode(secret);
}

const protectedPrefixes = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/categories",
  "/budgets",
  "/recurring",
  "/bills",
  "/goals",
  "/analytics",
  "/reports",
  "/calendar",
  "/settings",
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, getSecretKey());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 1. Redirect unauthenticated users trying to access protected dashboard routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect already authenticated users away from login/register to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes handle their own auth responses)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
