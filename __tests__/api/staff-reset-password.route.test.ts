// Tests para la API de reset password (POST /api/staff/[id]/reset-password)
import { POST } from "@/app/api/staff/[id]/reset-password/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

// Mock de next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

function createMockRequest(url: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

describe("Staff Reset Password API (App Router handler)", () => {
  let staffId: number;
  let testPrefix: string;

  beforeAll(async () => {
    // Crear un prefijo único para este test
    testPrefix = `staff-reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Limpiar cualquier dato previo con este prefijo
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: testPrefix
        }
      }
    });
    
    // Usar una transacción para asegurar que todo se guarde correctamente
    const result = await prisma.$transaction(async (tx) => {
      // Crear un staff member de prueba
      const staff = await tx.user.create({
        data: {
          username: `${testPrefix}-staff`,
          name: "Test",
          lastName: "Staff",
          email: `${testPrefix}@test.com`,
          passwordHash: "hashed_password", // Contraseña hasheada existente
          role: "RECEPTIONIST",
        },
      });
      console.log("[TEST][beforeAll] Staff creado:", staff);
      
      return { staff };
    });
    
    staffId = result.staff.id;
    console.log("[TEST][beforeAll] Todo creado exitosamente. Staff ID:", staffId);
  });

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

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  it("POST /api/staff/[id]/reset-password resetea correctamente la contraseña", async () => {
    // Mock session como ADMIN
    mockGetServerSession.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
      expires: "2024-12-31T23:59:59.999Z"
    });

    const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}/reset-password`);
    const res = await POST(req, { params: { id: String(staffId) } });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Password reset to default (123456)");
  });

  it("POST /api/staff/[id]/reset-password sin autenticación responde 401", async () => {
    // Mock session como null (no autenticado)
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}/reset-password`);
    const res = await POST(req, { params: { id: String(staffId) } });
    
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("POST /api/staff/[id]/reset-password sin permisos responde 403", async () => {
    // Mock session como EMPLOYEE (sin permisos)
    mockGetServerSession.mockResolvedValue({
      user: { id: "2", role: "RECEPTIONIST" },
      expires: "2024-12-31T23:59:59.999Z"
    });

    const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}/reset-password`);
    const res = await POST(req, { params: { id: String(staffId) } });
    
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Forbidden");
  });

  it("POST /api/staff/[id]/reset-password con ID inválido responde 400", async () => {
    // Mock session como ADMIN
    mockGetServerSession.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
      expires: "2024-12-31T23:59:59.999Z"
    });

    const req = createMockRequest(`http://localhost:3000/api/staff/abc/reset-password`);
    const res = await POST(req, { params: { id: "abc" } });
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid staff ID");
  });

  it("POST /api/staff/[id]/reset-password con staff inexistente responde 500", async () => {
    // Mock session como ADMIN
    mockGetServerSession.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
      expires: "2024-12-31T23:59:59.999Z"
    });

    const req = createMockRequest(`http://localhost:3000/api/staff/999999/reset-password`);
    const res = await POST(req, { params: { id: "999999" } });
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Internal Server Error");
  });

  it("POST /api/staff/[id]/reset-password con SUPERADMIN también funciona", async () => {
    // Mock session como SUPERADMIN
    mockGetServerSession.mockResolvedValue({
      user: { id: "1", role: "SUPERADMIN" },
      expires: "2024-12-31T23:59:59.999Z"
    });

    const req = createMockRequest(`http://localhost:3000/api/staff/${staffId}/reset-password`);
    const res = await POST(req, { params: { id: String(staffId) } });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Password reset to default (123456)");
  });
});

/**
 * Explicación general:
 * - Cada test simula una petición HTTP POST al endpoint de reset de contraseña.
 * - Se valida el status code, la estructura de la respuesta y los datos esperados.
 * - Se cubren casos exitosos, autenticación/autorización, ID inválido y staff inexistente.
 * - Se prepara un staff member real en la base de datos antes de los tests.
 * - Usa prefijos únicos para evitar conflictos entre tests paralelos.
 * - Mock de next-auth para simular diferentes estados de sesión y roles.
 */
