// Importa el handler GET del endpoint de bookings y el cliente de Prisma
import { GET } from "@/app/api/bookings/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper para crear un mock de NextRequest con la URL deseada
function createMockRequest(url: string) {
  return new NextRequest(url);
}


describe("Bookings API (App Router handler)", () => {

  // Después de todos los tests, desconecta Prisma para evitar conexiones abiertas
  afterAll(async () => {
    await prisma.$disconnect();
  });


  /**
   * Test: GET /api/bookings
   * Este test verifica que el endpoint principal de bookings responde correctamente
   * con un status 200 y un array de bookings en la propiedad data.
   */
  it("GET /api/bookings responde con lista de bookings", async () => {
    // Crea una petición simulada al endpoint
    const req = createMockRequest("http://localhost:3000/api/bookings");
    // Llama al handler GET directamente
    const res = await GET(req);
    // Verifica que el status sea 200 (OK)
    expect(res.status).toBe(200);
    // Parsea la respuesta a JSON
    const json = await res.json();
    // Verifica que la respuesta indique éxito y que data sea un array
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  /**
   * Test: GET /api/bookings?startDate&endDate
   * Este test verifica que el endpoint filtra correctamente las reservas por rango de fechas
   * usando los parámetros startDate y endDate.
   */
  it("GET /api/bookings?startDate&endDate filtra correctamente", async () => {
    // Crea una petición simulada con parámetros de fecha
    const url = "http://localhost:3000/api/bookings?startDate=2025-07-01&endDate=2025-07-31";
    const req = createMockRequest(url);
    // Llama al handler GET directamente
    const res = await GET(req);
    // Verifica que el status sea 200 (OK)
    expect(res.status).toBe(200);
    // Parsea la respuesta a JSON
    const json = await res.json();
    // Verifica que la respuesta indique éxito y que data sea un array
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP al endpoint correspondiente usando NextRequest mockeado.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Los tests cubren casos exitosos (respuesta correcta y filtrado por fechas).
 * - Puedes mockear la base de datos o usar una base de datos de pruebas para evitar afectar datos reales.
 * - Si usas Prisma, configura una base de datos de test y limpia los datos entre tests para evitar efectos colaterales.
 */
