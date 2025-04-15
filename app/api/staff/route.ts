import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth-options';
import { staffService, StaffCreateInput, StaffUpdateInput } from '@/services/staffService';
import { EmployeeStatus, UserRole } from '@prisma/client';

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
  } catch (error) {
    console.error('Error fetching staff:', error);
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
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['username', 'name', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` }, 
          { status: 400 }
        );
      }
    }
    
    // Create new staff member
    const newStaff = await staffService.createStaff(body as StaffCreateInput);
    
    // Remove sensitive information
    const { passwordHash, ...staffData } = newStaff;
    
    return NextResponse.json(staffData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    
    // Handle duplicate email or username
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email or username already exists' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}