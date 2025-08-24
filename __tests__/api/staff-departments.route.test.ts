import { GET, POST } from "@/app/api/staff/departments/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";

// Mock de next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Helper para generar nombres únicos garantizados
function generateUniqueDeptName(suffix: string): string {
  const timestamp = Date.now();
  const randomId = randomUUID().replace(/-/g, '').substring(0, 8);
  const hrtime = process.hrtime.bigint().toString().slice(-6);
  const uniqueName = `TEST_DEPT_${timestamp}_${hrtime}_${randomId}_${suffix}`;
  console.log(`[TEST] Generated unique name: ${uniqueName}`);
  return uniqueName;
}

// Helper para verificar que un nombre no exista antes de usarlo
async function ensureNameNotExists(name: string): Promise<void> {
  console.log(`[TEST] Checking if department name exists: ${name}`);
  const existing = await prisma.department.findFirst({
    where: { name }
  });
  
  if (existing) {
    console.log(`[TEST] Found existing department with name ${name} (ID: ${existing.id}), deleting it...`);
    await prisma.department.delete({
      where: { id: existing.id }
    });
    console.log(`[TEST] Successfully deleted existing department with name ${name}`);
  } else {
    console.log(`[TEST] No existing department found with name ${name} - good to proceed`);
  }
}

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
  let testSessionId: string;
  let createdDepartmentIds: number[] = [];

  beforeAll(async () => {
    // Crear un ID de sesión único para este test usando UUID
    testSessionId = randomUUID().replace(/-/g, '').substring(0, 8);
    
    console.log(`[TEST][beforeAll] Using test session ID: ${testSessionId}`);
    
    // Limpiar TODOS los departamentos de test previos de manera agresiva
    const cleaned = await prisma.department.deleteMany({
      where: {
        OR: [
          {
            name: {
              contains: "test-dept-"
            }
          },
          {
            name: {
              contains: "TEST_DEPT_"
            }
          },
          {
            name: {
              contains: testSessionId
            }
          }
        ]
      }
    });
    console.log(`[TEST][beforeAll] Cleaned up ${cleaned.count} existing test departments`);
    
    // Crear algunos departamentos de prueba para el test de GET con nombres garantizados únicos
    const baseName1 = `TEST_DEPT_${testSessionId}_IT_${Date.now()}`;
    const baseName2 = `TEST_DEPT_${testSessionId}_HR_${Date.now() + 1}`;
    
    console.log(`[TEST][beforeAll] Creating departments: ${baseName1}, ${baseName2}`);
    
    const dept1 = await prisma.department.create({
      data: {
        name: baseName1,
        description: "Information Technology Department",
      },
    });
    
    const dept2 = await prisma.department.create({
      data: {
        name: baseName2,
        description: "Human Resources Department",
      },
    });
    
    createdDepartmentIds.push(dept1.id, dept2.id);
    console.log(`[TEST][beforeAll] Successfully created departments with IDs: ${createdDepartmentIds.join(', ')}`);
    console.log(`[TEST][beforeAll] Department 1: ID ${dept1.id}, Name: ${dept1.name}`);
    console.log(`[TEST][beforeAll] Department 2: ID ${dept2.id}, Name: ${dept2.name}`);
  });

  afterAll(async () => {
    try {
      // Limpiar por IDs específicos primero
      if (createdDepartmentIds.length > 0) {
        await prisma.department.deleteMany({
          where: {
            id: {
              in: createdDepartmentIds
            }
          }
        });
        console.log(`[TEST][afterAll] Deleted departments with IDs: ${createdDepartmentIds.join(', ')}`);
      }
      
      // Luego limpiar por session ID como respaldo
      if (testSessionId) {
        const deletedByPrefix = await prisma.department.deleteMany({
          where: {
            name: {
              contains: testSessionId
            }
          }
        });
        console.log(`[TEST][afterAll] Additional cleanup by session ID deleted ${deletedByPrefix.count} departments`);
      }
    } catch (error) {
      console.error('[TEST][afterAll] Error during cleanup:', error);
    } finally {
      // Desconectar Prisma
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();
    
    // Agregar un delay más largo entre tests para evitar conflictos de timing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Limpiar cualquier departamento órfano que pueda existir con nombres de test
    // PERO NO eliminar los departamentos creados en beforeAll para el test GET
    const orphanDepts = await prisma.department.deleteMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: "TEST_DEPT_"
                }
              },
              {
                name: {
                  contains: "DuplicateTest"
                }
              }
            ]
          },
          {
            // NO eliminar los departamentos creados en beforeAll
            id: {
              notIn: createdDepartmentIds
            }
          }
        ]
      }
    });
    
    if (orphanDepts.count > 0) {
      console.log(`[TEST][beforeEach] Cleaned up ${orphanDepts.count} orphan test departments`);
    }
    
    // Verificar que no hay departamentos con nuestro session ID pendientes
    const existingDepts = await prisma.department.findMany({
      where: {
        name: {
          contains: testSessionId
        }
      }
    });
    
    // Si hay departamentos extra, agregarlos a nuestro tracking para limpieza
    existingDepts.forEach(dept => {
      if (!createdDepartmentIds.includes(dept.id)) {
        createdDepartmentIds.push(dept.id);
      }
    });
  });

  // Tests para GET /api/staff/departments
  describe("GET /api/staff/departments", () => {
    it("obtiene correctamente todos los departamentos", async () => {
      // Verificar estado de la base de datos antes del test
      const allDepts = await prisma.department.findMany({});
      console.log(`[TEST][GET] Total departments in DB: ${allDepts.length}`);
      console.log(`[TEST][GET] Created department IDs: ${createdDepartmentIds.join(', ')}`);
      console.log(`[TEST][GET] All departments:`, allDepts.map(d => `${d.id}: ${d.name}`));
      
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/departments");
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      console.log(`[TEST][GET] Response departments:`, json.departments);
      
      expect(json.departments).toBeDefined();
      expect(Array.isArray(json.departments)).toBe(true);
      expect(json.departments.length).toBeGreaterThanOrEqual(2); // Al menos los 2 que creamos
      
      // Verificar que incluye nuestros departamentos de prueba
      const departmentNames = json.departments.map((d: any) => d.name);
      const hasTestDepts = departmentNames.some((name: string) => name.includes(testSessionId));
      expect(hasTestDepts).toBe(true);
    });

    it("GET con SUPERADMIN funciona correctamente", async () => {
      // Mock session como SUPERADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "SUPERADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/departments");
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.departments).toBeDefined();
      expect(Array.isArray(json.departments)).toBe(true);
    });

    it("GET sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockRequest("http://localhost:3000/api/staff/departments");
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

      const req = createMockRequest("http://localhost:3000/api/staff/departments");
      const res = await GET();
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("GET verifica estructura de respuesta", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/departments");
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty("departments");
      expect(Array.isArray(json.departments)).toBe(true);
      
      // Verificar estructura de cada departamento
      if (json.departments.length > 0) {
        const department = json.departments[0];
        expect(department).toHaveProperty("id");
        expect(department).toHaveProperty("name");
        expect(typeof department.id).toBe("number");
        expect(typeof department.name).toBe("string");
      }
    });
  });

  // Tests para POST /api/staff/departments
  describe("POST /api/staff/departments", () => {
    it("crea correctamente un nuevo departamento", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueName = generateUniqueDeptName("Finance");
      await ensureNameNotExists(uniqueName);
      
      const newDepartment = {
        name: uniqueName,
        description: "Finance Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(uniqueName);
      expect(json.description).toBe("Finance Department");
      expect(json.id).toBeDefined();
      expect(typeof json.id).toBe("number");
      
      // Agregar a tracking para limpieza
      createdDepartmentIds.push(json.id);
    });

    it("POST con SUPERADMIN funciona correctamente", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "SUPERADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueName = generateUniqueDeptName("Marketing");
      await ensureNameNotExists(uniqueName);
      
      const newDepartment = {
        name: uniqueName,
        description: "Marketing Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(uniqueName);
      
      // Agregar a tracking para limpieza
      createdDepartmentIds.push(json.id);
    });

    it("POST sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const newDepartment = {
        name: generateUniqueDeptName("Test"),
        description: "Test Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
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

      const newDepartment = {
        name: generateUniqueDeptName("Test"),
        description: "Test Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });

    it("POST sin nombre requerido responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const newDepartment = {
        description: "Department without name",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Department name is required");
    });

    it("POST con nombre vacío responde 400", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const newDepartment = {
        name: "",
        description: "Department with empty name",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Department name is required");
    });

    it("POST con nombre duplicado responde 409", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      // Crear un nombre único para este test específico
      const uniqueName = generateUniqueDeptName("DuplicateTest");
      
      // Asegurar que no existe antes del test
      await ensureNameNotExists(uniqueName);
      
      console.log(`[TEST] Creating first department with name: ${uniqueName}`);
      
      const firstDept = {
        name: uniqueName,
        description: "First department for duplicate test",
      };

      const firstReq = createMockRequest("http://localhost:3000/api/staff/departments", "POST", firstDept);
      const firstRes = await POST(firstReq);
      
      console.log(`[TEST] First request response status: ${firstRes.status}`);
      
      if (firstRes.status !== 201) {
        const errorJson = await firstRes.json();
        console.error(`[TEST] First department creation failed:`, errorJson);
        
        // Verificar si el departamento ya existe
        const existingDept = await prisma.department.findFirst({
          where: { name: uniqueName }
        });
        console.log(`[TEST] Existing department check result:`, existingDept);
      }
      
      expect(firstRes.status).toBe(201);
      const firstJson = await firstRes.json();
      
      // Agregar a tracking para limpieza
      createdDepartmentIds.push(firstJson.id);
      console.log(`[TEST] First department created successfully with ID: ${firstJson.id}`);

      // Verificar que el departamento realmente existe en la base de datos
      const createdDept = await prisma.department.findUnique({
        where: { id: firstJson.id }
      });
      console.log(`[TEST] Verification - department exists in DB:`, createdDept?.name);

      // Ahora intentar crear un departamento con el mismo nombre exacto
      const duplicateDepartment = {
        name: uniqueName, // Exactamente el mismo nombre
        description: "Duplicate department for testing",
      };

      console.log(`[TEST] Attempting to create duplicate department with name: ${uniqueName}`);
      
      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", duplicateDepartment);
      const res = await POST(req);
      
      console.log(`[TEST] Duplicate request response status: ${res.status}`);
      
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe("Department with this name already exists");
    });

    it("POST solo con nombre funciona correctamente", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueName = generateUniqueDeptName("Legal");
      await ensureNameNotExists(uniqueName);
      
      const newDepartment = {
        name: uniqueName,
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(uniqueName);
      expect(json.id).toBeDefined();
      
      // Agregar a tracking para limpieza
      createdDepartmentIds.push(json.id);
    });

    it("POST verifica estructura de respuesta", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueName = generateUniqueDeptName("Operations");
      await ensureNameNotExists(uniqueName);
      
      const newDepartment = {
        name: uniqueName,
        description: "Operations Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      
      // Verificar estructura del departamento creado
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("name");
      expect(typeof json.id).toBe("number");
      expect(typeof json.name).toBe("string");
      expect(json.name).toBe(uniqueName);
      expect(json.description).toBe("Operations Department");
      
      // Agregar a tracking para limpieza
      createdDepartmentIds.push(json.id);
    });
  });
});

/**
 * Explicación general:
 * - Cada test simula peticiones HTTP GET y POST al endpoint de departamentos.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, validaciones y errores.
 * - Se crean departamentos de prueba en beforeAll para los tests de GET.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 * - Se agrupa los tests por método HTTP para mejor organización.
 * - Incluye tests para validación de campos requeridos y constraints únicos.
 * - Verifica la estructura específica de respuesta con { departments: [...] } para GET.
 */
