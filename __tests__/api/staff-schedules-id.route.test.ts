// Tests para la API de staff schedules (GET, PUT, DELETE /api/staff/schedules/[id])
import { GET, PUT, DELETE } from "@/app/api/staff/schedules/[id]/route";
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
  let scheduleId: number;
  let staffId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
    
    // Crear un staff member y schedule inicial para los tests de lectura
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

      const schedule = await tx.schedule.create({
        data: {
          userId: staff.id,
          dayOfWeek: 1, // Monday (0=Sunday, 1=Monday, ..., 6=Saturday)
          startTime: new Date("2024-01-01T08:00:00Z"),
          endTime: new Date("2024-01-01T17:00:00Z"),
        },
      });
      console.log("[TEST][beforeAll] Schedule creado:", schedule);
      
      return { staff, schedule };
    });
    
    staffId = result.staff.id;
    scheduleId = result.schedule.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Staff ID:", staffId, "Schedule ID:", scheduleId);
  });

  // Función auxiliar para crear un staff member y schedule para tests destructivos
  const createTestStaffAndSchedule = async (suffix: string = "") => {
    // Agregar un timestamp adicional para garantizar unicidad
    const uniqueSuffix = `${suffix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${process.hrtime.bigint()}`;
    
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

        const schedule = await tx.schedule.create({
          data: {
            userId: staff.id,
            dayOfWeek: 2, // Tuesday
            startTime: new Date("2024-01-01T09:00:00Z"),
            endTime: new Date("2024-01-01T18:00:00Z"),
          },
        });
        
        // Verificar que el schedule fue creado exitosamente
        const verifySchedule = await tx.schedule.findUnique({
          where: { id: schedule.id }
        });
        
        if (!verifySchedule) {
          throw new Error(`Schedule ${schedule.id} was not found after creation`);
        }
        
        console.log(`[TEST] Created staff and schedule: ${staff.id} - ${schedule.id} - ${staff.email}`);
        return { staffId: staff.id, scheduleId: schedule.id };
      } catch (error) {
        console.error(`[TEST] Error creating staff and schedule with suffix "${suffix}":`, error);
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
    // Reset mocks antes de cada test
    jest.clearAllMocks();
    
    // Agregar un pequeño delay entre tests para evitar conflictos de timing
    await new Promise(resolve => setTimeout(resolve, 5));
  });

  // Tests para GET /api/staff/schedules/[id]
  describe("GET /api/staff/schedules/[id]", () => {
    it("obtiene correctamente un horario", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`);
      const res = await GET(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(scheduleId);
      expect(json.userId).toBe(staffId);
      expect(json.dayOfWeek).toBe(1); // Monday
      expect(json.startTime).toBeDefined();
      expect(json.endTime).toBeDefined();
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`);
      const res = await GET(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("GET sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`);
      const res = await GET(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/abc`);
      const res = await GET(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid schedule ID");
    });

    it("GET con horario inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/999999`);
      const res = await GET(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Schedule not found");
    });
  });

  // Tests para PUT /api/staff/schedules/[id]
  describe("PUT /api/staff/schedules/[id]", () => {
    it("actualiza correctamente un horario", async () => {
      // Crear un schedule específico para este test
      const { scheduleId: testScheduleId } = await createTestStaffAndSchedule("update");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el schedule existe antes de intentar actualizarlo
      const existingSchedule = await prisma.schedule.findUnique({
        where: { id: testScheduleId }
      });
      expect(existingSchedule).toBeTruthy();
      console.log(`[TEST] Verified schedule exists: ${existingSchedule?.id} - userId: ${existingSchedule?.userId}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const updateData = {
        dayOfWeek: 3, // Wednesday
        startTime: new Date("2024-01-01T10:00:00Z").toISOString(),
        endTime: new Date("2024-01-01T19:00:00Z").toISOString(),
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${testScheduleId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testScheduleId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.dayOfWeek).toBe(3); // Wednesday
      expect(json.startTime).toBeDefined();
      expect(json.endTime).toBeDefined();
    });

    it("PUT sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`, "PUT", { dayOfWeek: 5 }); // Friday
      const res = await PUT(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("PUT sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`, "PUT", { dayOfWeek: 5 }); // Friday
      const res = await PUT(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("PUT con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/abc`, "PUT", { dayOfWeek: 5 }); // Friday
      const res = await PUT(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid schedule ID");
    });

    it("PUT con horario inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/999999`, "PUT", { dayOfWeek: 5 }); // Friday
      const res = await PUT(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Schedule not found");
    });

    it("PUT con manejo de fechas como strings", async () => {
      // Crear un schedule específico para este test
      const { scheduleId: testScheduleId } = await createTestStaffAndSchedule("dates");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el schedule existe antes de intentar actualizarlo
      const existingSchedule = await prisma.schedule.findUnique({
        where: { id: testScheduleId }
      });
      expect(existingSchedule).toBeTruthy();
      console.log(`[TEST] Verified schedule exists: ${existingSchedule?.id} - userId: ${existingSchedule?.userId}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const updateData = {
        startTime: "2024-01-01T11:00:00Z",
        endTime: "2024-01-01T20:00:00Z",
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${testScheduleId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testScheduleId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.startTime).toBeDefined();
      expect(json.endTime).toBeDefined();
    });
  });

  // Tests para DELETE /api/staff/schedules/[id]
  describe("DELETE /api/staff/schedules/[id]", () => {
    it("elimina correctamente un horario", async () => {
      // Crear un schedule específico para este test
      const { scheduleId: testScheduleId } = await createTestStaffAndSchedule("delete");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el schedule existe antes de intentar eliminarlo
      const existingSchedule = await prisma.schedule.findUnique({
        where: { id: testScheduleId }
      });
      expect(existingSchedule).toBeTruthy();
      console.log(`[TEST] Verified schedule exists before delete: ${existingSchedule?.id} - userId: ${existingSchedule?.userId}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${testScheduleId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testScheduleId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toBe("Schedule deleted successfully");
    });

    it("DELETE sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("DELETE sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/${scheduleId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(scheduleId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("DELETE con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/abc`, "DELETE");
      const res = await DELETE(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid schedule ID");
    });

    it("DELETE con horario inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/schedules/999999`, "DELETE");
      const res = await DELETE(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Schedule not found");
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET, PUT y DELETE al endpoint de horarios por ID.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, ID inválido y horario inexistente.
 * - Se prepara un staff member y horario real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Se agrupa los tests por método HTTP para mejor organización.
 * - Incluye tests específicos para el manejo de fechas y conversión de strings a Date objects.
 */
