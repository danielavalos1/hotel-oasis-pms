// Tests para la API de rooms (PATCH /api/rooms/[id])
import { PATCH } from "@/app/api/rooms/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function createMockRequest(url: string, body: any) {
  return new NextRequest(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("Rooms API (App Router handler)", () => {
  let roomId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `rooms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.room.deleteMany({
      where: {
        roomNumber: {
          startsWith: testPrefix
        }
      }
    });
    
    // Usar una transacción para asegurar que todo se guarde correctamente
    const result = await prisma.$transaction(async (tx) => {
      // Crea un room con número único
      const room = await tx.room.create({
        data: {
          roomNumber: `${testPrefix}-101`,
          type: "SENCILLA",
          capacity: 2,
          pricePerNight: 100,
          description: "Habitación de prueba",
          amenities: ["WiFi", "TV"],
          isAvailable: true,
        },
      });
      console.log("[TEST][beforeAll] Room creado:", room);
      
      return { room };
    });
    
    roomId = result.room.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Room ID:", roomId);
  });

  afterAll(async () => {
    // Limpiar los datos creados en este test
    if (testPrefix) {
      await prisma.room.deleteMany({
        where: {
          roomNumber: {
            startsWith: testPrefix
          }
        }
      });
    }
    await prisma.$disconnect();
  });

  it("PATCH /api/rooms/[id] actualiza correctamente una habitación", async () => {
    const body = { 
      pricePerNight: 150,
      description: "Habitación actualizada",
      isAvailable: false
    };
    const req = createMockRequest(`http://localhost:3000/api/rooms/${roomId}`, body);
    const res = await PATCH(req, { params: { id: String(roomId) } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.pricePerNight).toBe(150);
    expect(json.data.description).toBe("Habitación actualizada");
    expect(json.data.isAvailable).toBe(false);
  });

  it("PATCH /api/rooms/[id] con ID inválido responde 400", async () => {
    const body = { pricePerNight: 200 };
    const req = createMockRequest(`http://localhost:3000/api/rooms/abc`, body);
    const res = await PATCH(req, { params: { id: "abc" } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("ID inválido");
  });

  it("PATCH /api/rooms/[id] con habitación inexistente responde 500", async () => {
    const body = { pricePerNight: 200 };
    const req = createMockRequest(`http://localhost:3000/api/rooms/999999`, body);
    const res = await PATCH(req, { params: { id: "999999" } });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP PATCH al endpoint de habitaciones.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, ID inválido y habitación inexistente.
 * - Se prepara una habitación real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 */
