// Tests para la API de rooms (GET y POST /api/rooms)
import { GET, POST } from "@/app/api/rooms/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function createMockRequest(url: string, method: string = "GET", body?: any) {
  if (body && method !== "GET") {
    return new NextRequest(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Rooms Base API (App Router handler)", () => {
  let roomId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `rooms-base-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
      // Crear room de prueba para los tests GET
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

  // Tests para GET /api/rooms
  describe("GET /api/rooms", () => {
    it("devuelve todas las habitaciones sin parámetros", async () => {
      const req = createMockRequest("http://localhost:3000/api/rooms");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      
      // Verificar que incluye nuestra habitación de prueba
      const testRoom = json.data.find((r: any) => r.id === roomId);
      expect(testRoom).toBeDefined();
      expect(testRoom.roomNumber).toBe(`${testPrefix}-101`);
      expect(testRoom.type).toBe("SENCILLA");
      expect(testRoom.capacity).toBe(2);
    });

    it("devuelve habitaciones disponibles con parámetros de fecha", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Mañana
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3); // Pasado mañana
      
      const req = createMockRequest(
        `http://localhost:3000/api/rooms?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("maneja fechas inválidas en parámetros", async () => {
      const req = createMockRequest(
        "http://localhost:3000/api/rooms?startDate=fecha-invalida&endDate=otra-fecha-invalida"
      );
      const res = await GET(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Failed to fetch rooms");
    });
  });

  // Tests para POST /api/rooms
  describe("POST /api/rooms", () => {
    it("crea una nueva habitación correctamente", async () => {
      const newRoomData = {
        roomNumber: `${testPrefix}-102`,
        type: "DOBLE",
        capacity: 4,
        pricePerNight: 150,
        description: "Habitación doble de prueba",
        amenities: ["WiFi", "TV", "AC"],
        isAvailable: true,
      };
      
      const req = createMockRequest("http://localhost:3000/api/rooms", "POST", newRoomData);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.roomNumber).toBe(`${testPrefix}-102`);
      expect(json.data.type).toBe("DOBLE");
      expect(json.data.capacity).toBe(4);
      expect(json.data.pricePerNight).toBe("150"); // Prisma devuelve Decimal como string
      expect(json.data.amenities).toEqual(["WiFi", "TV", "AC"]);
    });

    it("maneja datos inválidos al crear habitación", async () => {
      const invalidRoomData = {
        roomNumber: `${testPrefix}-103`,
        type: "TIPO_INVALIDO", // Tipo que no existe en el enum
        capacity: 4,
        pricePerNight: 150,
      };
      
      const req = createMockRequest("http://localhost:3000/api/rooms", "POST", invalidRoomData);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Failed to create room");
      expect(json.details).toBeDefined();
    });

    it("maneja número de habitación duplicado", async () => {
      const duplicateRoomData = {
        roomNumber: `${testPrefix}-101`, // Mismo número que ya existe
        type: "SENCILLA",
        capacity: 2,
        pricePerNight: 100,
      };
      
      const req = createMockRequest("http://localhost:3000/api/rooms", "POST", duplicateRoomData);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Failed to create room");
      expect(json.details).toBeDefined();
    });

    it("maneja datos incompletos al crear habitación", async () => {
      const incompleteRoomData = {
        roomNumber: `${testPrefix}-104`,
        // Faltan campos requeridos como type, capacity, etc.
      };
      
      const req = createMockRequest("http://localhost:3000/api/rooms", "POST", incompleteRoomData);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Failed to create room");
      expect(json.details).toBeDefined();
    });

    it("crea habitación con datos mínimos requeridos", async () => {
      const minimalRoomData = {
        roomNumber: `${testPrefix}-105`,
        type: "SUITE_A", // Usar tipo válido del enum
        capacity: 6,
        pricePerNight: 300,
        description: "Suite de prueba", // Agregar descripción requerida
        amenities: [], // Agregar amenities como array vacío
        isAvailable: true, // Agregar disponibilidad
      };
      
      const req = createMockRequest("http://localhost:3000/api/rooms", "POST", minimalRoomData);
      const res = await POST(req);
      
      // Debug: ver el error si falla
      if (res.status !== 201) {
        const json = await res.json();
        console.log("[TEST][DEBUG] Error response:", json);
      }
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.roomNumber).toBe(`${testPrefix}-105`);
      expect(json.data.type).toBe("SUITE_A");
      expect(json.data.capacity).toBe(6);
      expect(json.data.pricePerNight).toBe("300"); // Prisma devuelve Decimal como string
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET y POST al endpoint base de habitaciones.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Para GET: se cubren casos sin parámetros, con fechas válidas y fechas inválidas.
 * - Para POST: se cubren casos de creación exitosa, datos inválidos, duplicados e incompletos.
 * - Se prepara una habitación real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Se agrupa los tests por método HTTP para mejor organización.
 */
