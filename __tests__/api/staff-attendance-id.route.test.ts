// Tests para la API de staff attendance (GET, PUT, DELETE /api/staff/attendance/[id])
import { GET, PUT, DELETE } from "@/app/api/staff/attendance/[id]/route";
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

describe("Staff Attendance API (App Router handler)", () => {
  let attendanceId: number;
  let staffId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.attendance.deleteMany({
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
    
    // Crear un staff member y attendance inicial para los tests de lectura
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

      const attendance = await tx.attendance.create({
        data: {
          userId: staff.id,
          date: new Date(),
          checkInTime: new Date(),
          checkOutTime: null,
          status: "PRESENT",
        },
      });
      console.log("[TEST][beforeAll] Attendance creado:", attendance);
      
      return { staff, attendance };
    });
    
    staffId = result.staff.id;
    attendanceId = result.attendance.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Staff ID:", staffId, "Attendance ID:", attendanceId);
  });

  // Función auxiliar para crear un staff member y attendance para tests destructivos
  const createTestStaffAndAttendance = async (suffix: string = "") => {
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

        const attendance = await tx.attendance.create({
          data: {
            userId: staff.id,
            date: new Date(),
            checkInTime: new Date(),
            checkOutTime: null,
            status: "PRESENT",
          },
        });
        
        // Verificar que los registros fueron creados exitosamente
        const verifyStaff = await tx.user.findUnique({
          where: { id: staff.id }
        });
        const verifyAttendance = await tx.attendance.findUnique({
          where: { id: attendance.id }
        });
        
        if (!verifyStaff || !verifyAttendance) {
          throw new Error(`Records not found after creation: staff=${!!verifyStaff}, attendance=${!!verifyAttendance}`);
        }
        
        console.log(`[TEST] Created staff and attendance: ${staff.id} - ${staff.email}, attendance: ${attendance.id}`);
        return { staffId: staff.id, attendanceId: attendance.id };
      } catch (error) {
        console.error(`[TEST] Error creating staff and attendance with suffix "${suffix}":`, error);
        throw error;
      }
    });
  };

  afterAll(async () => {
    // Limpiar los datos creados en este test
    if (testPrefix) {
      await prisma.attendance.deleteMany({
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
    // Agregar un pequeño delay entre tests para evitar condiciones de carrera
    await new Promise(resolve => setTimeout(resolve, 15));
  });

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  // Tests para GET /api/staff/attendance/[id]
  describe("GET /api/staff/attendance/[id]", () => {
    it("obtiene correctamente un registro de asistencia", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`);
      const res = await GET(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(attendanceId);
      expect(json.userId).toBe(staffId);
      expect(json.status).toBe("PRESENT");
      expect(json.user).toBeDefined();
      expect(json.user.name).toBe("Test");
      expect(json.user.lastName).toBe("Staff");
      expect(json.user.department).toBeDefined(); // Puede ser null
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`);
      const res = await GET(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("GET sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`);
      const res = await GET(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/abc`);
      const res = await GET(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid attendance ID");
    });

    it("GET con registro inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/999999`);
      const res = await GET(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Attendance record not found");
    });
  });

  // Tests para PUT /api/staff/attendance/[id]
  describe("PUT /api/staff/attendance/[id]", () => {
    it("actualiza correctamente un registro de asistencia", async () => {
      // Crear un registro específico para este test
      const { attendanceId: testAttendanceId } = await createTestStaffAndAttendance("update");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el attendance existe antes de intentar actualizarlo
      const existingAttendance = await prisma.attendance.findUnique({
        where: { id: testAttendanceId }
      });
      expect(existingAttendance).toBeTruthy();
      console.log(`[TEST] Verified attendance exists: ${existingAttendance?.id}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const updateData = {
        status: "ABSENT",
        checkOutTime: new Date().toISOString(),
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${testAttendanceId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testAttendanceId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("ABSENT");
      expect(json.checkOutTime).toBeDefined();
      expect(json.user).toBeDefined();
    });

    it("PUT sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`, "PUT", { status: "ABSENT" });
      const res = await PUT(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("PUT sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`, "PUT", { status: "ABSENT" });
      const res = await PUT(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("PUT con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/abc`, "PUT", { status: "ABSENT" });
      const res = await PUT(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid attendance ID");
    });

    it("PUT con registro inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/999999`, "PUT", { status: "ABSENT" });
      const res = await PUT(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Attendance record not found");
    });

    it("PUT con manejo de fechas como strings", async () => {
      // Crear un registro específico para este test
      const { attendanceId: testAttendanceId } = await createTestStaffAndAttendance("dates");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const updateData = {
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
        date: new Date().toISOString(),
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${testAttendanceId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testAttendanceId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.checkInTime).toBeDefined();
      expect(json.checkOutTime).toBeDefined();
      expect(json.date).toBeDefined();
    });

    it("PUT con checkOutTime vacío lo convierte a null", async () => {
      // Crear un registro específico para este test
      const { attendanceId: testAttendanceId } = await createTestStaffAndAttendance("checkout");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const updateData = {
        checkOutTime: "",
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${testAttendanceId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testAttendanceId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.checkOutTime).toBeNull();
    });
  });

  // Tests para DELETE /api/staff/attendance/[id]
  describe("DELETE /api/staff/attendance/[id]", () => {
    it("elimina correctamente un registro de asistencia", async () => {
      // Crear un registro específico para este test
      const { attendanceId: testAttendanceId } = await createTestStaffAndAttendance("delete");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el attendance existe antes de intentar eliminarlo
      const existingAttendance = await prisma.attendance.findUnique({
        where: { id: testAttendanceId }
      });
      expect(existingAttendance).toBeTruthy();
      console.log(`[TEST] Verified attendance exists before delete: ${existingAttendance?.id}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${testAttendanceId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testAttendanceId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toBe("Attendance record deleted successfully");
    });

    it("DELETE sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("DELETE sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/${attendanceId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(attendanceId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("DELETE con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/abc`, "DELETE");
      const res = await DELETE(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid attendance ID");
    });

    it("DELETE con registro inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/attendance/999999`, "DELETE");
      const res = await DELETE(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Attendance record not found");
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET, PUT y DELETE al endpoint de asistencia por ID.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, ID inválido y registro inexistente.
 * - Se prepara un staff member y registro de asistencia real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Se agrupa los tests por método HTTP para mejor organización.
 * - Incluye tests específicos para el manejo de fechas y conversión de strings a Date objects.
 */
