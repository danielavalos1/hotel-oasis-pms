import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth-options';
import { staffService, StaffCreateInput } from '@/services/staffService';
import { EmployeeStatus, UserRole, Prisma } from '@prisma/client';
import { z } from 'zod';

// Zod schema para creación de staff
enum _UserRoleProxy { // proxy para evitar colisión de import
  ADMIN = 'ADMIN', RECEPTIONIST = 'RECEPTIONIST', HOUSEKEEPER = 'HOUSEKEEPER', SUPERADMIN = 'SUPERADMIN'
}
const StaffCreateSchema = z.object({
  username: z.string().nonempty(),
  name: z.string().nonempty(),
  lastName: z.string().optional().nullable(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(_UserRoleProxy),
  departmentId: z.number().optional().nullable().transform(val => val ?? undefined),
  position: z.string().optional().nullable(),
  hireDate: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

// Get all staff members with optional filters
export async function GET(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin or superadmin
    const userRole = session.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as EmployeeStatus | undefined;
    const role = url.searchParams.get('role') as UserRole | undefined;
    const departmentId = url.searchParams.get('departmentId') 
      ? parseInt(url.searchParams.get('departmentId')!) 
      : undefined;
    
    // Get staff with filters
    const staff = await staffService.getAllStaff({ status, role, departmentId });
    
    return NextResponse.json(staff);
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Create new staff member
export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin or superadmin
    const userRole = session.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Validar payload con Zod
    const json = await request.json();
    const parsed = StaffCreateSchema.safeParse(json);
    if (!parsed.success) {
      const messages = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    const data = parsed.data;
    // Asegurar que departmentId undefined si no viene
    if (data.departmentId === undefined) delete data.departmentId;

    // Crear empleado con datos validados
    const newStaff = await staffService.createStaff(data as StaffCreateInput);
    
    // Remove sensitive information
    const { passwordHash, ...staffData } = newStaff;
    // Enviar respuesta siempre con objeto
    return NextResponse.json(staffData, { status: 201 });

  } catch (err: unknown) {
    // Si es error de duplicado de Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Email o username ya existe' }, { status: 409 });
    }
    // Error genérico
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}