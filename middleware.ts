import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Server Actions POST — never redirect, just refresh the session cookie.
  if (request.headers.get("next-action")) return response;

  if (!user) {
    if (isPublic(pathname)) return response;
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  // Si l'user existe mais pas de role trouvé, rediriger à login
  if (!role) {
    console.warn(`[MW] User ${user.id} missing role, redirecting to login`);
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  const home = role === "consultant" ? "/admin" : "/dashboard";

  if (pathname === "/" || pathname === "/login") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = home;
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  if (role === "client" && pathname.startsWith("/admin")) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    return NextResponse.redirect(redirect);
  }

  if (role === "consultant" && pathname.startsWith("/dashboard")) {
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
