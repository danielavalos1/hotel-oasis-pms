// Tests para la API de staff schedules (GET, POST /api/staff/schedules)
import { GET, POST } from "@/app/api/staff/schedules/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

// Mock de next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

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

describe("Staff Schedules API (App Router handler)", () => {
  let staffId: number;
  let schedule1Id: number;
  let schedule2Id: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test con mayor entropía
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const processId = process.hrtime.bigint().toString();
    testPrefix = `schedules-${timestamp}-${randomId}-${processId}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.schedule.deleteMany({
      where: {
        user: {
          email: {
            startsWith: testPrefix
          }
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: testPrefix
        }
      }
    });
    
    // Crear un staff member y schedules iniciales para los tests de lectura
    const result = await prisma.$transaction(async (tx) => {
      const staff = await tx.user.create({
        data: {
          username: `${testPrefix}-staff`,
          name: "Test",
          lastName: "Staff",
          email: `${testPrefix}@test.com`,
          passwordHash: "hashed_password",
          role: "RECEPTIONIST",
        },
      });
      console.log("[TEST][beforeAll] Staff creado:", staff);

      const schedule1 = await tx.schedule.create({
        data: {
          userId: staff.id,
          dayOfWeek: 1, // Monday
          startTime: new Date("2024-01-01T08:00:00Z"),
          endTime: new Date("2024-01-01T17:00:00Z"),
          isRecurring: true,
        },
      });

      const schedule2 = await tx.schedule.create({
        data: {
          userId: staff.id,
          dayOfWeek: 2, // Tuesday
          startTime: new Date("2024-01-01T09:00:00Z"),
          endTime: new Date("2024-01-01T18:00:00Z"),
          isRecurring: true,
        },
      });
      console.log("[TEST][beforeAll] Schedules creados:", { schedule1, schedule2 });
      
      return { staff, schedule1, schedule2 };
    });
    
    staffId = result.staff.id;
    schedule1Id = result.schedule1.id;
    schedule2Id = result.schedule2.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Staff ID:", staffId, "Schedule IDs:", [schedule1Id, schedule2Id]);
  });

  // Función auxiliar para crear un staff member para tests de creación
  const createTestStaff = async (suffix: string = "") => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const processId = process.hrtime.bigint().toString();
    const uniqueSuffix = `${suffix}-${timestamp}-${randomId}-${processId}`;
    
    return await prisma.$transaction(async (tx) => {
      try {
        const staff = await tx.user.create({
          data: {
            username: `${testPrefix}-staff-${uniqueSuffix}`,
            name: "Test",
            lastName: "Staff",
            email: `${testPrefix}-${uniqueSuffix}@test.com`,
            passwordHash: "hashed_password",
            role: "RECEPTIONIST",
          },
        });
        
        // Verificar que el staff fue creado correctamente
        const verifyStaff = await tx.user.findUnique({
          where: { id: staff.id }
        });
        
        if (!verifyStaff) {
          throw new Error(`Staff not found after creation: ${staff.id}`);
        }
        
        console.log(`[TEST] Created staff: ${staff.id} - ${staff.email}`);
        return staff.id;
      } catch (error) {
        console.error(`[TEST] Error creating staff with suffix "${suffix}":`, error);
        throw error;
      }
    });
  };

  afterAll(async () => {
    // Limpiar los datos creados en este test
    if (testPrefix) {
      await prisma.schedule.deleteMany({
        where: {
          user: {
            email: {
              startsWith: testPrefix
            }
          }
        }
      });
      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: testPrefix
          }
        }
      });
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset mocks antes de cada test y agregar delay para evitar condiciones de carrera
    jest.clearAllMocks();
    await new Promise(resolve => setTimeout(resolve, 15));
  });

  // Tests para GET /api/staff/schedules
  describe("GET /api/staff/schedules", () => {
    it("obtiene todos los horarios cuando no se especifica userId", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/schedules");
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBeGreaterThanOrEqual(2); // Al menos nuestros 2 schedules de prueba
      
      // Verificar estructura de los schedules
      const ourSchedules = json.filter((s: any) => s.userId === staffId);
      expect(ourSchedules.length).toBe(2);
      expect(ourSchedules[0]).toHaveProperty('id');
      expect(ourSchedules[0]).toHaveProperty('userId');
      expect(ourSchedules[0]).toHaveProperty('dayOfWeek');
      expect(ourSchedules[0]).toHaveProperty('startTime');
      expect(ourSchedules[0]).toHaveProperty('endTime');
      expect(ourSchedules[0]).toHaveProperty('user');
    });

    it("obtiene horarios filtrados por userId cuando se especifica", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules?userId=${staffId}`);
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2); // Nuestros 2 schedules de prueba
      
      // Verificar que todos los schedules son del usuario correcto
      json.forEach((schedule: any) => {
        expect(schedule.userId).toBe(staffId);
      });
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest("http://localhost:3000/api/staff/schedules");
      const res = await GET(req);
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("GET sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/schedules");
      const res = await GET(req);
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET con SUPERADMIN role funciona correctamente", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "SUPERADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/schedules");
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json)).toBe(true);
    });
  });

  // Tests para POST /api/staff/schedules
  describe("POST /api/staff/schedules", () => {
    it("crea un nuevo horario correctamente", async () => {
      // Crear un staff específico para este test
      const testStaffId = await createTestStaff("create");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: testStaffId,
        dayOfWeek: 3, // Wednesday
        startTime: new Date("2024-01-01T10:00:00Z").toISOString(),
        endTime: new Date("2024-01-01T19:00:00Z").toISOString(),
        isRecurring: true,
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.userId).toBe(testStaffId);
      expect(json.dayOfWeek).toBe(3);
      expect(json.isRecurring).toBe(true);
      expect(json.startTime).toBeDefined();
      expect(json.endTime).toBeDefined();
    });

    it("POST sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const scheduleData = {
        userId: staffId,
        dayOfWeek: 4,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("POST sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: staffId,
        dayOfWeek: 4,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("POST con campo userId faltante responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        dayOfWeek: 4,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing required field: userId");
    });

    it("POST con campo startTime faltante responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: staffId,
        dayOfWeek: 4,
        endTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing required field: startTime");
    });

    it("POST con campo endTime faltante responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: staffId,
        dayOfWeek: 4,
        startTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing required field: endTime");
    });

    it("POST con campo dayOfWeek faltante responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: staffId,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing required field: dayOfWeek");
    });

    it("POST con userId inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: 999999, // ID inexistente
        dayOfWeek: 4,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Staff member not found");
    });

    it("POST con fechas como strings funciona correctamente", async () => {
      // Crear un staff específico para este test
      const testStaffId = await createTestStaff("dates");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: testStaffId,
        dayOfWeek: 5, // Friday
        startTime: "2024-01-01T11:00:00Z",
        endTime: "2024-01-01T20:00:00Z",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.userId).toBe(testStaffId);
      expect(json.dayOfWeek).toBe(5);
      expect(json.startTime).toBeDefined();
      expect(json.endTime).toBeDefined();
    });

    it("POST con SUPERADMIN role funciona correctamente", async () => {
      // Crear un staff específico para este test
      const testStaffId = await createTestStaff("superadmin");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "SUPERADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const scheduleData = {
        userId: testStaffId,
        dayOfWeek: 6, // Saturday
        startTime: new Date("2024-01-01T12:00:00Z").toISOString(),
        endTime: new Date("2024-01-01T21:00:00Z").toISOString(),
      };

      const req = createMockRequest("http://localhost:3000/api/staff/schedules", "POST", scheduleData);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.userId).toBe(testStaffId);
      expect(json.dayOfWeek).toBe(6);
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET y POST al endpoint de horarios del personal.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, campos faltantes y validaciones.
 * - Se prepara un staff member y horarios reales en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Se agrupa los tests por método HTTP para mejor organización.
 * - Incluye tests para query parameters (userId) y validación de campos requeridos.
 * - Valida el manejo de fechas tanto como objetos Date como strings.
 * - Prueba ambos roles autorizados: ADMIN y SUPERADMIN.
 */
