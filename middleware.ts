import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas públicas que no requieren autenticación
const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth",
  "/assets",
];

// Orígenes permitidos para CORS desde variable de entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:4321", "https://v2.hoteloasis.mx"]; // Valores predeterminados si no hay variable

// Agregar función para manejar CORS
function setCorsHeaders(response: NextResponse, request: NextRequest) {
  // Obtener el origen de la solicitud
  const origin = request.headers.get("origin");

  // Si el origen está en nuestra lista de permitidos, lo usamos, de lo contrario usamos el primer origen permitido
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

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
    // Para /assets, permite cualquier subruta (imágenes, etc.)
    if (publicPath === "/assets" && path.startsWith("/assets/")) return true;
    return false;
  });
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Manejar preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return setCorsHeaders(new NextResponse(null, { status: 200 }), request);
  }

  const token = await getToken({ req: request });

  // Manejo de rutas API
  if (path.startsWith("/api") && !path.startsWith("/api/auth")) {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey && process.env.ALLOWED_API_KEYS?.split(",").includes(apiKey)) {
      return setCorsHeaders(NextResponse.next(), request);
    }

    if (!token) {
      return setCorsHeaders(
        new NextResponse(
          JSON.stringify({
            success: false,
            message: "authentication required",
          }),
          { status: 401, headers: { "content-type": "application/json" } }
        ),
        request
      );
    }

    return setCorsHeaders(NextResponse.next(), request);
  }

  // Redirigir la ruta raíz al dashboard o login según autenticación
  if (path === "/") {
    if (token) {
      return setCorsHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        request
      );
    }
    return setCorsHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
      request
    );
  }

  // Si es una ruta pública, permitir acceso sin redirección
  if (isPublicPath(path)) {
    if (token && path === "/login") {
      return setCorsHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        request
      );
    }
    return setCorsHeaders(NextResponse.next(), request);
  }

  // Rutas protegidas
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return setCorsHeaders(NextResponse.redirect(loginUrl), request);
  }

  return setCorsHeaders(NextResponse.next(), request);
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
