// Tests para la API de staff departments (GET, POST /api/staff/departments)
import { GET, POST } from "@/app/api/staff/departments/route";
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
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test con más entropía
    testPrefix = `dept-base-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${process.hrtime.bigint().toString(36)}`;
    
    // Limpiar TODOS los departamentos de test de cualquier ejecución previa
    // Esto es más agresivo pero necesario para evitar conflictos
    await prisma.department.deleteMany({
      where: {
        OR: [
          {
            name: {
              startsWith: "dept-"
            }
          },
          {
            name: {
              contains: "test"
            }
          },
          {
            name: {
              contains: "Test"
            }
          },
          {
            name: {
              startsWith: testPrefix
            }
          }
        ]
      }
    });
    
    console.log(`[TEST][beforeAll] Using test prefix: ${testPrefix}`);
    
    // Crear algunos departamentos de prueba para el test de GET
    await prisma.$transaction(async (tx) => {
      await tx.department.create({
        data: {
          name: `${testPrefix}-IT`,
          description: "Information Technology Department",
        },
      });
      
      await tx.department.create({
        data: {
          name: `${testPrefix}-HR`,
          description: "Human Resources Department",
        },
      });
      
      console.log("[TEST][beforeAll] Departments de prueba creados");
    });
  });

  afterAll(async () => {
    // Limpiar los datos creados en este test de manera más agresiva
    if (testPrefix) {
      await prisma.department.deleteMany({
        where: {
          OR: [
            {
              name: {
                startsWith: testPrefix
              }
            },
            {
              name: {
                contains: testPrefix.split('-')[1] // Usar parte del timestamp
              }
            }
          ]
        }
      });
    }
    
    // Desconectar Prisma
    await prisma.$disconnect();
  });

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  // Tests para GET /api/staff/departments
  describe("GET /api/staff/departments", () => {
    it("obtiene correctamente todos los departamentos", async () => {
      // Mock session como ADMIN
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const req = createMockRequest("http://localhost:3000/api/staff/departments");
      const res = await GET();
      
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.departments).toBeDefined();
      expect(Array.isArray(json.departments)).toBe(true);
      expect(json.departments.length).toBeGreaterThanOrEqual(2); // Al menos los 2 que creamos
      
      // Verificar que incluye nuestros departamentos de prueba
      const departmentNames = json.departments.map((d: any) => d.name);
      expect(departmentNames).toContain(`${testPrefix}-IT`);
      expect(departmentNames).toContain(`${testPrefix}-HR`);
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

      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDepartment = {
        name: `${testPrefix}-Finance-${uniqueSuffix}`,
        description: "Finance Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(`${testPrefix}-Finance-${uniqueSuffix}`);
      expect(json.description).toBe("Finance Department");
      expect(json.id).toBeDefined();
      expect(typeof json.id).toBe("number");
    });

    it("POST con SUPERADMIN funciona correctamente", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "SUPERADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDepartment = {
        name: `${testPrefix}-Marketing-${uniqueSuffix}`,
        description: "Marketing Department",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(`${testPrefix}-Marketing-${uniqueSuffix}`);
    });

    it("POST sin autenticación responde 401", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const newDepartment = {
        name: `${testPrefix}-Test`,
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
        name: `${testPrefix}-Test`,
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

      // Primero crear un departamento específico para este test con un nombre garantizado único
      const uniqueSuffix = `DuplicateTest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${process.hrtime.bigint().toString(36)}`;
      let uniqueName = `${testPrefix}-${uniqueSuffix}`;
      
      // Verificar que no existe antes de crear
      const existing = await prisma.department.findFirst({
        where: { name: uniqueName }
      });
      
      if (existing) {
        // Si ya existe, agregamos más entropía
        const extraSuffix = `Extra-${Date.now()}-${Math.random().toString(36)}`;
        uniqueName = `${testPrefix}-${uniqueSuffix}-${extraSuffix}`;
      }
      
      console.log(`[TEST] Creating first department with name: ${uniqueName}`);
      
      const firstDept = {
        name: uniqueName,
        description: "First department for duplicate test",
      };

      const firstReq = createMockRequest("http://localhost:3000/api/staff/departments", "POST", firstDept);
      const firstRes = await POST(firstReq);
      
      if (firstRes.status !== 201) {
        const errorJson = await firstRes.json();
        console.error(`[TEST] Failed to create first department:`, errorJson);
        throw new Error(`Failed to create first department: ${JSON.stringify(errorJson)}`);
      }
      
      console.log(`[TEST] First department created successfully`);

      // Ahora intentar crear un departamento con el mismo nombre
      const duplicateDepartment = {
        name: uniqueName, // Usar exactamente el mismo nombre
        description: "Duplicate department for testing",
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", duplicateDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe("Department with this name already exists");
    });

    it("POST solo con nombre funciona correctamente", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDepartment = {
        name: `${testPrefix}-Legal-${uniqueSuffix}`,
      };

      const req = createMockRequest("http://localhost:3000/api/staff/departments", "POST", newDepartment);
      const res = await POST(req);
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(`${testPrefix}-Legal-${uniqueSuffix}`);
      expect(json.id).toBeDefined();
    });

    it("POST verifica estructura de respuesta", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "2024-12-31T23:59:59.999Z"
      });

      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDepartment = {
        name: `${testPrefix}-Operations-${uniqueSuffix}`,
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
      expect(json.name).toBe(`${testPrefix}-Operations-${uniqueSuffix}`);
      expect(json.description).toBe("Operations Department");
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
