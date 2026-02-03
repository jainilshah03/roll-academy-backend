import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* =========================
     1️⃣ HANDLE CORS (API ONLY)
  ========================= */

  if (pathname.startsWith("/api")) {
    // Handle preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization",
        },
      });
    }

    const res = NextResponse.next();

    res.headers.set(
      "Access-Control-Allow-Origin",
      "http://localhost:3000"
    );
    res.headers.set(
      "Access-Control-Allow-Credentials",
      "true"
    );

    return res;
  }

  /* =========================
     2️⃣ PROTECT ADMIN ROUTES
  ========================= */

  if (pathname.startsWith("/admin")) {
    const token =
      req.cookies.get("auth_token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    // ❌ Not logged in → redirect
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/signin", req.url)
      );
    }
  }

  return NextResponse.next();
}

/* =========================
   APPLY MIDDLEWARE TO BOTH
========================= */
export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};

