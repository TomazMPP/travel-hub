import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page, API login route, and static assets
  if (
    pathname === "/login" ||
    pathname === "/api/auth" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("travel-hub-auth")?.value;

  if (token !== process.env.AUTH_SECRET) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
