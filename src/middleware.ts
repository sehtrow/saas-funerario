import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Permitir acceso libre a la página de login general
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Detectar rutas de administración (ej: /admin/mi-funeraria/...)
  const match = pathname.match(/^\/admin\/([^/]+)/);
  if (match) {
    const slug = match[1];

    // Verificar si existe la cookie de sesión para este slug específico
    const sessionCookie = request.cookies.get(`session_${slug}`);

    if (!sessionCookie) {
      // Si no hay sesión, redirigir al login general
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};