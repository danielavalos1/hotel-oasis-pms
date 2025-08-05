// Tests para la API de staff departments (GET, PUT, DELETE /api/staff/departments/[id])
import { GET, PUT, DELETE } from "@/app/api/staff/departments/[id]/route";
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

describe("Staff Departments API (App Router handler)", () => {
  let departmentId: number;
  let testPrefix: string;

  // Forzar ejecución secuencial de todos los tests
  jest.setTimeout(60000); // Aumentar timeout para tests secuenciales
  
  // Mutex simple para asegurar ejecución secuencial
  let testMutex = Promise.resolve();

  beforeAll(async () => {
    // Crear un prefijo único para este test con máxima entropía
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const processId = process.hrtime.bigint().toString();
    const extraRandom = Math.random().toString(36).substr(2, 6);
    testPrefix = `dept-${timestamp}-${randomId}-${processId}-${extraRandom}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.department.deleteMany({
      where: {
        name: {
          startsWith: testPrefix
        }
      }
    });
    
    // Crear un departamento inicial para los tests de lectura
    const result = await prisma.$transaction(async (tx) => {
      const department = await tx.department.create({
        data: {
          name: `${testPrefix}-IT`,
          description: "Technology Department",
        },
      });
      console.log("[TEST][beforeAll] Department creado:", department);
      
      return { department };
    });
    
    departmentId = result.department.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Department ID:", departmentId);
  });

  // Función auxiliar para crear un departamento para tests destructivos
  const createTestDepartment = async (suffix: string = "") => {
    // Agregar un timestamp adicional para garantizar unicidad extrema
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const processId = process.hrtime.bigint().toString();
    const uniqueSuffix = `${suffix}-${timestamp}-${randomId}-${processId}`;
    
    return await prisma.$transaction(async (tx) => {
      try {
        // Primero verificar si ya existe un departamento con este nombre
        const existingDept = await tx.department.findFirst({
          where: { name: `${testPrefix}-${uniqueSuffix}` }
        });
        
        if (existingDept) {
          console.log(`[TEST] Department already exists, using existing: ${existingDept.id}`);
          return existingDept.id;
        }
        
        const department = await tx.department.create({
          data: {
            name: `${testPrefix}-${uniqueSuffix}`,
            description: `Test Department ${uniqueSuffix}`,
          },
        });
        
        // Verificar que el departamento fue creado exitosamente
        const verifyDept = await tx.department.findUnique({
          where: { id: department.id }
        });
        
        if (!verifyDept) {
          throw new Error(`Department ${department.id} was not found after creation`);
        }
        
        console.log(`[TEST] Created department: ${department.id} - ${department.name}`);
        
        // Agregar un delay adicional para asegurar que la transacción se confirme
        await new Promise(resolve => setTimeout(resolve, 20));
        
        return department.id;
      } catch (error) {
        console.error(`[TEST] Error creating department with suffix "${suffix}":`, error);
        throw error;
      }
    });
  };

  afterAll(async () => {
    // Limpiar los datos creados en este test
    if (testPrefix) {
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
    // Usar mutex para forzar ejecución secuencial
    await testMutex;
    testMutex = new Promise(resolve => {
      setTimeout(() => {
        // Reset mocks antes de cada test
        jest.clearAllMocks();
        resolve();
      }, 100); // Delay más largo entre tests
    });
    await testMutex;
  });

  // Tests para GET /api/staff/departments/[id]
  describe("GET /api/staff/departments/[id]", () => {
    it("obtiene correctamente un departamento", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${departmentId}`);
      const res = await GET(req, { params: { id: String(departmentId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe(departmentId);
      expect(json.name).toBe(`${testPrefix}-IT`);
      expect(json.description).toBe("Technology Department");
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${departmentId}`);
      const res = await GET(req, { params: { id: String(departmentId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("GET sin permisos responde 403", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${departmentId}`);
      const res = await GET(req, { params: { id: String(departmentId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/abc`);
      const res = await GET(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid department ID");
    });

    it("GET con departamento inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/999999`);
      const res = await GET(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Department not found");
    });
  });

  // Tests para PUT /api/staff/departments/[id]
  describe("PUT /api/staff/departments/[id]", () => {
    it("actualiza correctamente un departamento", async () => {
      // Crear un departamento específico para este test
      const testDepartmentId = await createTestDepartment("update");
      
      // Agregar un delay más largo para asegurar que la creación se complete completamente
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que el departamento existe antes de intentar actualizarlo
      const existingDept = await prisma.department.findUnique({
        where: { id: testDepartmentId }
      });
      expect(existingDept).toBeTruthy();
      console.log(`[TEST] Verified department exists: ${existingDept?.id} - ${existingDept?.name}`);
      
      // Verificar también que no ha sido eliminado por otro test
      if (!existingDept) {
        throw new Error(`Department ${testDepartmentId} was deleted before this test could use it`);
      }
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const uniqueUpdateSuffix = `updated-${timestamp}-${randomId}`;
      const updateData = {
        name: `${testPrefix}-${uniqueUpdateSuffix}`,
        description: "Updated Department Description",
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testDepartmentId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.name).toBe(`${testPrefix}-${uniqueUpdateSuffix}`);
      expect(json.description).toBe("Updated Department Description");
    });

    it("PUT sin autenticación responde 401", async () => {
      // Crear un departamento específico para este test
      const testDepartmentId = await createTestDepartment("unauth");
      
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId}`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: String(testDepartmentId) } });
      
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("PUT sin permisos responde 403", async () => {
      // Crear un departamento específico para este test
      const testDepartmentId = await createTestDepartment("forbidden");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId}`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: String(testDepartmentId) } });
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("PUT con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/abc`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: "abc" } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid department ID");
    });

    it("PUT sin nombre requerido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${departmentId}`, "PUT", { description: "Only description" });
      const res = await PUT(req, { params: { id: String(departmentId) } });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Department name is required");
    });

    it("PUT con departamento inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/999999`, "PUT", { name: "Test" });
      const res = await PUT(req, { params: { id: "999999" } });
      
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Department not found");
    });

    it("PUT con nombre duplicado responde 409", async () => {
      // Crear dos departamentos específicos para este test
      const testDepartmentId1 = await createTestDepartment("dup1");
      
      // Agregar un delay más largo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que el primer departamento existe
      const dept1 = await prisma.department.findUnique({
        where: { id: testDepartmentId1 }
      });
      expect(dept1).toBeTruthy();
      console.log(`[TEST] Verified first department exists: ${dept1?.id} - ${dept1?.name}`);
      
      if (!dept1) {
        throw new Error(`First department ${testDepartmentId1} was deleted before this test could use it`);
      }
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const uniqueName = `${testPrefix}-dup2-fixed-${timestamp}-${randomId}`;
      const dept2Result = await prisma.department.create({
        data: {
          name: uniqueName,
          description: "Test Department for duplicate test",
        },
      });
      
      console.log(`[TEST] Created second department: ${dept2Result.id} - ${dept2Result.name}`);
      
      // Agregar otro delay para asegurar que ambos departamentos están confirmados
      await new Promise(resolve => setTimeout(resolve, 50));
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      // Intentar actualizar el primer departamento con el nombre del segundo
      const updateData = {
        name: dept2Result.name, // Usar el nombre real del segundo departamento
      };

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId1}`, "PUT", updateData);
      const res = await PUT(req, { params: { id: String(testDepartmentId1) } });
      
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe("Department with this name already exists");
    });
  });

  // Tests para DELETE /api/staff/departments/[id]
  describe("DELETE /api/staff/departments/[id]", () => {
    it("elimina correctamente un departamento", async () => {
      // Crear un departamento específico para este test
      const testDepartmentId = await createTestDepartment("delete");
      
      // Agregar un delay más largo para asegurar que la creación se complete completamente
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que el departamento existe antes de intentar eliminarlo
      const existingDept = await prisma.department.findUnique({
        where: { id: testDepartmentId }
      });
      expect(existingDept).toBeTruthy();
      console.log(`[TEST] Verified department exists before delete: ${existingDept?.id} - ${existingDept?.name}`);
      
      // Verificar también que no ha sido eliminado por otro test
      if (!existingDept) {
        throw new Error(`Department ${testDepartmentId} was deleted before this test could use it`);
      }
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testDepartmentId) } });
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toBe("Department deleted successfully");
    });

    it("DELETE sin autenticación responde 401", async () => {
      // Crear un departamento específico para este test
      const testDepartmentId = await createTestDepartment("delete-unauth");
      
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testDepartmentId) } });
      
      expect(res).toBeDefined();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("DELETE sin permisos responde 403", async () => {
      // Crear un departamento específico para este test
      const testDepartmentId = await createTestDepartment("delete-forbidden");
      
      mockGetServerSession.mockResolvedValue({
        user: { id: "2", role: "RECEPTIONIST" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/${testDepartmentId}`, "DELETE");
      const res = await DELETE(req, { params: { id: String(testDepartmentId) } });
      
      expect(res).toBeDefined();
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("DELETE con ID inválido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/abc`, "DELETE");
      const res = await DELETE(req, { params: { id: "abc" } });
      
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid department ID");
    });

    it("DELETE con departamento inexistente responde 404", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest(`http://localhost:3000/api/staff/departments/999999`, "DELETE");
      const res = await DELETE(req, { params: { id: "999999" } });
      
      expect(res).toBeDefined();
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Department not found");
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET, PUT y DELETE al endpoint de departamentos por ID.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, ID inválido y departamento inexistente.
 * - Se prepara un departamento real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Se agrupa los tests por método HTTP para mejor organización.
 * - Incluye tests específicos para validación de nombres únicos y campos requeridos.
 */
