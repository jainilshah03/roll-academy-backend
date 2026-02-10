import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://roll.academy",
  "https://www.roll.academy",
];

function getCorsOrigin(origin: string | null) {
  if (!origin) return "https://www.roll.academy";

  // Allow any Vercel preview domain + your custom domains + localhost
  if (
    origin.endsWith(".vercel.app") ||
    ALLOWED_ORIGINS.includes(origin)
  ) {
    return origin;
  }

  return "https://www.roll.academy";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");
  const allowedOrigin = getCorsOrigin(origin);

  if (pathname.startsWith("/api")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  }

  if (pathname.startsWith("/admin")) {
    const token =
      req.cookies.get("auth_token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
