import { type NextRequest, NextResponse } from "next/server";
import {
  getPreferredLocale,
  isLocale,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "@/i18n/config";

function resolveLocale(request: NextRequest) {
  const savedLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(savedLocale)
    ? savedLocale
    : getPreferredLocale(request.headers.get("accept-language"));
}

function redirectToLocale(request: NextRequest, locale: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${url.pathname}`;
  return NextResponse.redirect(url);
}

function withLocalePreference(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-conyva-locale", locale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Language", locale);
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = resolveLocale(request);

  if (pathname === "/") {
    return redirectToLocale(request, locale);
  }

  const [, routeLocale] = pathname.split("/");
  if (!isLocale(routeLocale)) {
    return redirectToLocale(request, locale);
  }

  if (
    pathname === `/${routeLocale}` ||
    pathname === `/${routeLocale}/auth/login` ||
    pathname === `/${routeLocale}/auth/register` ||
    pathname === `/${routeLocale}/opengraph-image` ||
    pathname === `/${routeLocale}/twitter-image`
  ) {
    return withLocalePreference(request, routeLocale);
  }

  if (request.cookies.has("conyva_refresh")) {
    return withLocalePreference(request, routeLocale);
  }

  const loginUrl = new URL(`/${routeLocale}/auth/login`, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
