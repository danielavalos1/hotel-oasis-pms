import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth-options';
import { staffService, StaffUpdateInput } from '@/services/staffService';

// Get staff member by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Parse staff ID
    const staffId = parseInt(params.id);
    
    if (isNaN(staffId)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }
    
    // Get staff by ID
    const staff = await staffService.getStaffById(staffId);
    
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    
    // Remove sensitive information
    const { passwordHash, ...staffData } = staff;
    
    return NextResponse.json(staffData);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Update staff member
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Parse staff ID and request body
    const staffId = parseInt(params.id);
    
    if (isNaN(staffId)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Update staff
    const updatedStaff = await staffService.updateStaff(staffId, body as StaffUpdateInput);
    
    // Remove sensitive information
    const { passwordHash, ...staffData } = updatedStaff;
    
    return NextResponse.json(staffData);
  } catch (error: any) {
    console.error('Error updating staff:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Delete staff member (change status to TERMINATED)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  let staffId: number;
  
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
    
    // Parse staff ID
    staffId = parseInt(params.id);
    console.log(`[API][DELETE] Received staff ID: ${params.id}, parsed as: ${staffId}`);
    
    if (isNaN(staffId)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }
    
    // Instead of deleting, we change the status to TERMINATED
    console.log(`[API][DELETE] Attempting to terminate staff with ID: ${staffId}`);
    const terminatedStaff = await staffService.changeStaffStatus(staffId, 'TERMINATED');
    
    // Remove sensitive information
    const { passwordHash, ...staffData } = terminatedStaff;
    
    return NextResponse.json(staffData);
  } catch (error: any) {
    // Don't log P2025 errors as they are expected for non-existent staff
    if (error.code === 'P2025') {
      console.log(`[API][DELETE] Staff with ID ${params.id} not found (expected for 404 test)`);
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    
    // Log unexpected errors
    console.error('Error terminating staff:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}