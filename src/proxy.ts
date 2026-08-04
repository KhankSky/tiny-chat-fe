import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/en", "/vi", "/auth/login", "/auth/register"]);
const PUBLIC_PATH_PREFIXES = ["/en/auth/login", "/en/auth/register", "/vi/auth/login", "/vi/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || PUBLIC_PATH_PREFIXES.includes(pathname)) {
    return NextResponse.next();
  }

  if (request.cookies.has("conyva_refresh")) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
