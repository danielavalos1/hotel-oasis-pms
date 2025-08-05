// Tests para la API de staff (GET, PUT, DELETE /api/staff/[id])
import { GET, PUT, DELETE } from "@/app/api/staff/[id]/route";
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

describe("Staff API (App Router handler)", () => {
  let staffId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: testPrefix
        }
      }
    });
    
    // Crear un staff member inicial para los tests de lectura
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
      
      return { staff };
    });
    
    staffId = result.staff.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Staff ID:", staffId);
  });

  // Función auxiliar para crear un staff member para tests destructivos
  const createTestStaff = async (suffix: string = "") => {
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
        console.log("[TEST] Staff creado para test:", staff);
        // Verificar que el usuario fue creado exitosamente
        const verifyStaff = await tx.user.findUnique({
          where: { id: staff.id }
        });
        
        if (!verifyStaff) {
          throw new Error(`Staff ${staff.id} was not found after creation`);
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

  // Tests para GET /api/staff/[id]
  describe("GET /api/staff/[id]", () => {
    it("obtiene correctamente un staff member", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}`);
      const res = await GET(req, { params: { id: String(staffId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(staffId);
      expect(json.username).toBe(`${testPrefix}-staff`);
      expect(json.name).toBe("Test");
      expect(json.lastName).toBe("Staff");
      expect(json.passwordHash).toBeUndefined(); // Debe estar oculto
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}`);
      const res = await GET(req, { params: { id: String(staffId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("GET sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}`);
      const res = await GET(req, { params: { id: String(staffId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/abc`);
      const res = await GET(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid staff ID");
    });

    it("GET con staff inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/999999`);
      const res = await GET(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Staff not found");
    });
  });

  // Tests para PUT /api/staff/[id]
  describe("PUT /api/staff/[id]", () => {
    it("actualiza correctamente un staff member", async () => {
      // Crear un staff member específico para este test
      const testStaffId = await createTestStaff("update");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el staff member existe antes de intentar actualizarlo
      const existingStaff = await prisma.user.findUnique({
        where: { id: testStaffId }
      });
      expect(existingStaff).toBeTruthy();
      console.log(`[TEST] Verified staff exists: ${existingStaff?.id} - ${existingStaff?.email}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const updateData = {
        name: "Updated Name",
        lastName: "Updated LastName",
        role: "ADMIN"
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/${testStaffId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testStaffId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.name).toBe("Updated Name");
      expect(json.lastName).toBe("Updated LastName");
      expect(json.role).toBe("ADMIN");
      expect(json.passwordHash).toBeUndefined(); // Debe estar oculto
    });

    it("PUT sin autenticación responde 401", async () => {
      // Crear un staff member específico para este test
      const testStaffId = await createTestStaff("put-401");
      
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/${testStaffId}`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: String(testStaffId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("PUT sin permisos responde 403", async () => {
      // Crear un staff member específico para este test
      const testStaffId = await createTestStaff("put-403");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/${testStaffId}`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: String(testStaffId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("PUT con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/abc`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid staff ID");
    });

    it("PUT con staff inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/999999`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Staff not found");
    });
  });

  // Tests para DELETE /api/staff/[id]
  describe("DELETE /api/staff/[id]", () => {
    it("termina correctamente un staff member", async () => {
      // Crear un staff member específico para este test
      const testStaffId = await createTestStaff("delete");
      
      // Agregar un pequeño delay para asegurar que la creación se complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que el staff member existe antes de intentar eliminarlo
      const existingStaff = await prisma.user.findUnique({
        where: { id: testStaffId }
      });
      expect(existingStaff).toBeTruthy();
      console.log(`[TEST] Verified staff exists before delete: ${existingStaff?.id} - ${existingStaff?.email}`);
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/${testStaffId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testStaffId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(testStaffId);
      expect(json.passwordHash).toBeUndefined(); // Debe estar oculto
    });

    it("DELETE sin autenticación responde 401", async () => {
      // Crear un staff member específico para este test
      const testStaffId = await createTestStaff("delete-401");
      
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/${testStaffId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testStaffId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("DELETE sin permisos responde 403", async () => {
      // Crear un staff member específico para este test
      const testStaffId = await createTestStaff("delete-403");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/${testStaffId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testStaffId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("DELETE con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/abc`, "DELETE");
      const res = await DELETE(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid staff ID");
    });

    it("DELETE con staff inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/999999`, "DELETE");
      const res = await DELETE(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Staff not found");
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET, PUT y DELETE al endpoint de staff por ID.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, ID inválido y staff inexistente.
 * - Se prepara un staff member real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Se agrupa los tests por método HTTP para mejor organización.
 */
