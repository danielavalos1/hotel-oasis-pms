// Tests para la API de staff stats (GET /api/staff/stats)
import { GET } from "@/app/api/staff/stats/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { EmployeeStatus, AttendanceStatus } from "@prisma/client";

// Mock de next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

function createMockRequest(url: string = "http://localhost:3000/api/staff/stats") {
  return new NextRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

describe("Staff Stats API (App Router handler)", () => {
  let testPrefix: string;
  let departmentId: number;
  let staffIds: number[] = [];

  beforeAll(async () => {
    // Crear un prefijo único para este test con mayor entropía
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const processId = process.hrtime.bigint().toString();
    testPrefix = `stats-test-${timestamp}-${randomId}-${processId}`;
    
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
    await prisma.department.deleteMany({
      where: {
        name: {
          startsWith: testPrefix
        }
      }
    });
    
    // Crear datos de prueba para las estadísticas
    const result = await prisma.$transaction(async (tx) => {
      // Crear departamento
      const department = await tx.department.create({
        data: {
          name: `${testPrefix}-IT-Stats`,
          description: "Test IT Department for Stats",
        },
      });

      // Crear staff members con diferentes estados
      const staff1 = await tx.user.create({
        data: {
          username: `${testPrefix}-staff1`,
          name: "Test",
          lastName: "Staff1",
          email: `${testPrefix}-staff1@test.com`,
          passwordHash: "hashed_password",
          role: "ADMIN",
          departmentId: department.id,
          status: EmployeeStatus.ACTIVE,
        },
      });

      const staff2 = await tx.user.create({
        data: {
          username: `${testPrefix}-staff2`,
          name: "Test",
          lastName: "Staff2",
          email: `${testPrefix}-staff2@test.com`,
          passwordHash: "hashed_password",
          role: "ADMIN",
          departmentId: department.id,
          status: EmployeeStatus.INACTIVE,
        },
      });

      const staff3 = await tx.user.create({
        data: {
          username: `${testPrefix}-staff3`,
          name: "Test",
          lastName: "Staff3",
          email: `${testPrefix}-staff3@test.com`,
          passwordHash: "hashed_password",
          role: "SUPERADMIN",
          departmentId: department.id,
          status: EmployeeStatus.ON_LEAVE,
        },
      });

      // Crear registros de asistencia para hoy
      const today = new Date();
      today.setHours(8, 0, 0, 0);

      const attendance1 = await tx.attendance.create({
        data: {
          userId: staff1.id,
          checkInTime: today,
          date: new Date(),
          status: AttendanceStatus.PRESENT,
        },
      });

      const attendance2 = await tx.attendance.create({
        data: {
          userId: staff2.id,
          checkInTime: new Date(today.getTime() + 30 * 60 * 1000), // 30 min tarde
          date: new Date(),
          status: AttendanceStatus.LATE,
        },
      });

      const attendance3 = await tx.attendance.create({
        data: {
          userId: staff3.id,
          checkInTime: today,
          date: new Date(),
          status: AttendanceStatus.ON_LEAVE,
        },
      });

      console.log("[TEST][beforeAll] Datos de prueba creados:", {
        department,
        staff: [staff1, staff2, staff3],
        attendance: [attendance1, attendance2, attendance3]
      });
      
      return { 
        department, 
        staffIds: [staff1.id, staff2.id, staff3.id]
      };
    });
    
    departmentId = result.department.id;
    staffIds = result.staffIds;
    console.log("[TEST][beforeAll] Setup completado. Department ID:", departmentId, "Staff IDs:", staffIds);
  });

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
      await prisma.department.deleteMany({
        where: {
          name: {
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

  // Tests para GET /api/staff/stats
  describe("GET /api/staff/stats", () => {
    it("obtiene estadísticas del personal correctamente", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      
      // Verificar estructura de la respuesta
      expect(json).toHaveProperty('stats');
      expect(json.stats).toHaveProperty('totalStaff');
      expect(json.stats).toHaveProperty('activeStaff');
      expect(json.stats).toHaveProperty('departments');
      expect(json.stats).toHaveProperty('pendingDocuments');
      expect(json.stats).toHaveProperty('attendance');
      expect(json.stats).toHaveProperty('employeeStatus');
      expect(json.stats).toHaveProperty('departmentDistribution');

      // Verificar estadísticas básicas
      expect(typeof json.stats.totalStaff).toBe('number');
      expect(typeof json.stats.activeStaff).toBe('number');
      expect(typeof json.stats.departments).toBe('number');
      expect(typeof json.stats.pendingDocuments).toBe('number');

      // Verificar estructura de attendance
      expect(json.stats.attendance).toHaveProperty('present');
      expect(json.stats.attendance).toHaveProperty('absent');
      expect(json.stats.attendance).toHaveProperty('late');
      expect(json.stats.attendance).toHaveProperty('onLeave');
      expect(json.stats.attendance).toHaveProperty('halfDay');

      // Verificar estructura de employeeStatus
      expect(json.stats.employeeStatus).toHaveProperty('active');
      expect(json.stats.employeeStatus).toHaveProperty('inactive');
      expect(json.stats.employeeStatus).toHaveProperty('onLeave');
      expect(json.stats.employeeStatus).toHaveProperty('suspended');
      expect(json.stats.employeeStatus).toHaveProperty('terminated');

      // Verificar que departmentDistribution es un array
      expect(Array.isArray(json.stats.departmentDistribution)).toBe(true);
    });

    it("verifica que las estadísticas de asistencia reflejan los datos de prueba", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      
      // Verificar que las estadísticas de asistencia incluyen nuestros datos de prueba
      expect(json.stats.attendance.present).toBeGreaterThanOrEqual(1); // Al menos 1 presente
      expect(json.stats.attendance.late).toBeGreaterThanOrEqual(1); // Al menos 1 tarde
      expect(json.stats.attendance.onLeave).toBeGreaterThanOrEqual(1); // Al menos 1 en permiso
    });

    it("verifica que las estadísticas de empleados reflejan los datos de prueba", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      
      // Verificar que las estadísticas de empleados incluyen nuestros datos de prueba
      // Nota: Solo cuenta ADMIN y SUPERADMIN según el filtro del endpoint
      expect(json.stats.employeeStatus.active).toBeGreaterThanOrEqual(1); // Al menos 1 activo
      expect(json.stats.employeeStatus.inactive).toBeGreaterThanOrEqual(1); // Al menos 1 inactivo
      expect(json.stats.employeeStatus.onLeave).toBeGreaterThanOrEqual(1); // Al menos 1 en permiso
    });

    it("verifica que los departamentos incluyen el conteo de usuarios activos", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      
      // Buscar nuestro departamento de prueba
      const testDepartment = json.stats.departmentDistribution.find(
        (dept: any) => dept.name === `${testPrefix}-IT-Stats`
      );
      
      expect(testDepartment).toBeDefined();
      expect(testDepartment).toHaveProperty('id');
      expect(testDepartment).toHaveProperty('name');
      expect(testDepartment).toHaveProperty('count');
      expect(typeof testDepartment.count).toBe('number');
      expect(testDepartment.count).toBeGreaterThanOrEqual(1); // Al menos 1 usuario activo
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("GET sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET con SUPERADMIN role funciona correctamente", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "SUPERADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('stats');
    });

    it("verifica que todos los contadores son números no negativos", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      
      // Verificar que todos los contadores básicos son números >= 0
      expect(json.stats.totalStaff).toBeGreaterThanOrEqual(0);
      expect(json.stats.activeStaff).toBeGreaterThanOrEqual(0);
      expect(json.stats.departments).toBeGreaterThanOrEqual(0);
      expect(json.stats.pendingDocuments).toBeGreaterThanOrEqual(0);

      // Verificar contadores de asistencia
      Object.values(json.stats.attendance).forEach((count: any) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });

      // Verificar contadores de estado de empleados
      Object.values(json.stats.employeeStatus).forEach((count: any) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });

      // Verificar contadores de departamentos
      json.stats.departmentDistribution.forEach((dept: any) => {
        expect(typeof dept.count).toBe('number');
        expect(dept.count).toBeGreaterThanOrEqual(0);
      });
    });

    it("maneja el caso cuando no hay datos de asistencia para hoy", async () => {
      // Crear un usuario temporal sin asistencia para hoy
      const tempStaff = await prisma.user.create({
        data: {
          username: `${testPrefix}-temp`,
          name: "Temp",
          lastName: "Staff",
          email: `${testPrefix}-temp@test.com`,
          passwordHash: "hashed_password",
          role: "ADMIN",
          status: EmployeeStatus.ACTIVE,
        },
      });

      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest();
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      
      // Las estadísticas deben estar definidas incluso sin datos
      expect(json.stats.attendance).toBeDefined();
      expect(typeof json.stats.attendance.present).toBe('number');
      expect(typeof json.stats.attendance.absent).toBe('number');

      // Limpiar el usuario temporal
      await prisma.user.delete({ where: { id: tempStaff.id } });
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET al endpoint de estadísticas del personal.
 * - Se valida el status code, la estructura de la respuesta y los tipos de datos.
 * - Se cubren casos exitosos, autenticación/autorización y edge cases.
 * - Se preparan datos de prueba reales en la base de datos (staff, departamentos, asistencia).
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Valida la estructura completa de las estadísticas incluyendo:
 *   - Estadísticas básicas (totalStaff, activeStaff, departments, pendingDocuments)
 *   - Estadísticas de asistencia por estado (present, absent, late, onLeave, halfDay)
 *   - Distribución de estados de empleados (active, inactive, onLeave, suspended, terminated)
 *   - Conteo de usuarios por departamento
 * - Incluye tests específicos para verificar que los datos de prueba se reflejan en las estadísticas.
 * - Maneja edge cases como ausencia de datos de asistencia.
 */
