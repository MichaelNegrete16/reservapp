import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("reservapp-session")?.value;
  const { pathname } = request.nextUrl;

  // Proteger rutas del dashboard — requiere cualquier sesión
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Proteger rutas de admin — requiere rol admin
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Si ya está autenticado, redirigir fuera de login/registro
  if (pathname === "/login" || pathname === "/registro") {
    if (session === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session === "user") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/registro"],
};
