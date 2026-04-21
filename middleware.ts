import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const rsc = request.headers.get("rsc");
  const nextAction = request.headers.get("next-action");
  console.log(
    `[MW] ${request.method} ${pathname}${rsc ? " [RSC]" : ""}${nextAction ? " [ACTION]" : ""} user=${user?.id.slice(0, 8) ?? "null"} role=${role ?? "null"}`,
  );

  // Server Actions POST — never redirect, just refresh the session cookie
  if (nextAction) return response;

  if (!user) {
    if (isPublic(pathname)) return response;
    console.log(`[MW] → /login (no user)`);
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  const home = role === "consultant" ? "/admin" : "/dashboard";

  if (pathname === "/" || pathname === "/login") {
    console.log(`[MW] → ${home} (home redirect)`);
    const redirect = request.nextUrl.clone();
    redirect.pathname = home;
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  if (role === "client" && pathname.startsWith("/admin")) {
    console.log(`[MW] → /dashboard (client hit /admin)`);
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    return NextResponse.redirect(redirect);
  }

  if (role === "consultant" && pathname.startsWith("/dashboard")) {
    console.log(`[MW] → /admin (consultant hit /dashboard)`);
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
