import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas públicas que no requieren autenticación
const publicPaths = ["/login", "/register", "/forgot-password", "/api/auth"];

function isPublicPath(path: string) {
  return publicPaths.some((publicPath) => path.startsWith(publicPath));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({ req: request });

  // Manejo de rutas API
  if (path.startsWith("/api") && !path.startsWith("/api/auth")) {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey && process.env.ALLOWED_API_KEYS?.split(",").includes(apiKey)) {
      return NextResponse.next();
    }

    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "authentication required" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    return NextResponse.next();
  }

  // Redirigir la ruta raíz al dashboard o login según autenticación
  if (path === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si es una ruta pública, permitir acceso sin redirección
  if (isPublicPath(path)) {
    if (token && path === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
