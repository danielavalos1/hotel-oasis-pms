import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas públicas que no requieren autenticación
const publicPaths = ["/login", "/register", "/forgot-password", "/api/auth"];

// Agregar función para manejar CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "http://localhost:4321");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

function isPublicPath(path: string) {
  return publicPaths.some((publicPath) => {
    // Verifica si el path comienza con alguna de las rutas públicas
    if (path === publicPath) return true;
    // Para /api/auth, permite cualquier subruta
    if (publicPath === "/api/auth" && path.startsWith("/api/auth/"))
      return true;
    return false;
  });
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Manejar preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return setCorsHeaders(new NextResponse(null, { status: 200 }));
  }

  const token = await getToken({ req: request });

  // Manejo de rutas API
  if (path.startsWith("/api") && !path.startsWith("/api/auth")) {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey && process.env.ALLOWED_API_KEYS?.split(",").includes(apiKey)) {
      return setCorsHeaders(NextResponse.next());
    }

    if (!token) {
      return setCorsHeaders(
        new NextResponse(
          JSON.stringify({
            success: false,
            message: "authentication required",
          }),
          { status: 401, headers: { "content-type": "application/json" } }
        )
      );
    }

    return setCorsHeaders(NextResponse.next());
  }

  // Redirigir la ruta raíz al dashboard o login según autenticación
  if (path === "/") {
    if (token) {
      return setCorsHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url))
      );
    }
    return setCorsHeaders(
      NextResponse.redirect(new URL("/login", request.url))
    );
  }

  // Si es una ruta pública, permitir acceso sin redirección
  if (isPublicPath(path)) {
    if (token && path === "/login") {
      return setCorsHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url))
      );
    }
    return setCorsHeaders(NextResponse.next());
  }

  // Rutas protegidas
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return setCorsHeaders(NextResponse.redirect(loginUrl));
  }

  return setCorsHeaders(NextResponse.next());
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
