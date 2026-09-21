import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { evaluateProxyGate } from "@/lib/auth/proxy";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip Next.js internal paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") || // Webhooks have their own signature auth
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Parse session token from cookies or Authorization header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const token = bearerToken || cookieToken;

  // 3. Verify session token using Edge-compatible JWT
  const session = token ? await verifySessionToken(token) : null;

  // 4. Evaluate RBAC Proxy Gate policy
  const gateResult = evaluateProxyGate(pathname, session);

  if (!gateResult.allowed) {
    // API routes receive structured JSON errors
    if (gateResult.statusCode) {
      return NextResponse.json(
        {
          error: gateResult.reason || "Unauthorized",
          status: gateResult.statusCode,
          pathname,
          activeRole: session?.role || "ANONYMOUS",
        },
        { status: gateResult.statusCode }
      );
    }

    // Web routes receive redirect
    if (gateResult.redirectUrl) {
      return NextResponse.redirect(new URL(gateResult.redirectUrl, request.url));
    }
  }

  // 5. If authorized, enrich request headers as a Proxy Gate for downstream route segments
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-middleware-proxy-gate", "passed");

  if (session) {
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-role", session.role);
    requestHeaders.set("x-user-email", session.email);
    requestHeaders.set("x-user-name", session.name);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
