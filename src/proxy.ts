import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile } from "@dal";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

/**
 * Next.js 16 Proxy (voorheen "Middleware"). Draait op de nodejs-runtime
 * (verplicht sinds Next 16, zie de guide), waardoor Prisma hier rechtstreeks
 * bevraagd kan worden om de sessie te valideren voor /admin.
 *
 * Dit is enkel een optimistische check: de admin-layout (src/app/admin/
 * (protected)/layout.tsx) valideert de sessie nogmaals server-side.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const isLoginRoute = pathname === "/admin/login";
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionId ? await getSessionProfile(sessionId) : null;

  if (!isLoginRoute && !session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
