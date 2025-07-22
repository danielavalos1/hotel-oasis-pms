// Tests para la API de guests usando el handler del App Router


import { GET, POST } from "@/app/api/guests/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper para crear un mock de NextRequest
function createMockRequest(url: string, options?: { method?: string; body?: any }) {
  const req = new NextRequest(url, {
    method: options?.method || "GET",
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
  });
  return req;
}

describe("Guests API (App Router handler)", () => {
  // Limpia la tabla de guests antes de cada test para evitar efectos colaterales
  beforeEach(async () => {
    await prisma.guest.deleteMany();
  });

  // Desconecta Prisma después de todos los tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test: GET /api/guests
   * Verifica que el endpoint responde con un array de guests
   */
  it("GET /api/guests responde con lista de guests", async () => {
    // Inserta un guest de prueba antes del test
    await prisma.guest.create({
      data: {
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        phoneNumber: "1234567890",
      },
    });
    const req = createMockRequest("http://localhost:3000/api/guests");
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  /**
   * Test: GET /api/guests?search=Test
   * Verifica que el endpoint filtra correctamente por nombre, apellido o email
   */
  it("GET /api/guests?search filtra correctamente", async () => {
    await prisma.guest.create({
      data: {
        firstName: "Daniel",
        lastName: "Avalos",
        email: "daniel@example.com",
        phoneNumber: "1234567890",
      },
    });
    const req = createMockRequest("http://localhost:3000/api/guests?search=daniel");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data[0].firstName.toLowerCase()).toContain("daniel");
  });

  /**
   * Test: POST /api/guests
   * Verifica que se puede crear un guest correctamente
   */
  it("POST /api/guests crea un guest correctamente", async () => {
    const body = {
      firstName: "Nuevo",
      lastName: "Guest",
      email: "nuevo@example.com",
      phoneNumber: "5555555555",
    };
    const req = createMockRequest("http://localhost:3000/api/guests", { method: "POST", body });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.email).toBe(body.email);
  });

  /**
   * Test: POST /api/guests con datos inválidos
   * Verifica que la validación funciona y responde con error 400
   */
  it("POST /api/guests con datos inválidos responde 400", async () => {
    const body = {
      firstName: "",
      lastName: "",
      email: "no-es-un-email",
      phoneNumber: "",
    };
    const req = createMockRequest("http://localhost:3000/api/guests", { method: "POST", body });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Validation error");
  });

  /**
   * Test: POST /api/guests con email duplicado
   * Verifica que responde con error 409 si el email ya existe
   */
  it("POST /api/guests con email duplicado responde 409", async () => {
    const body = {
      firstName: "Repetido",
      lastName: "Guest",
      email: "repetido@example.com",
      phoneNumber: "1111111111",
    };
    // Crea el guest primero
    await prisma.guest.create({ data: body });
    // Intenta crearlo de nuevo
    const req = createMockRequest("http://localhost:3000/api/guests", { method: "POST", body });
    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Email already exists");
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP al endpoint correspondiente usando NextRequest mockeado.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Los tests cubren casos exitosos y de error (validación y duplicados).
 * - Se limpia la tabla de guests antes de cada test para evitar efectos colaterales.
 * - Si usas Prisma, configura una base de datos de test y limpia los datos entre tests para evitar afectar datos reales.
 */
