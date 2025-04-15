import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';

// Get attendance record by ID
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
    
    // Parse attendance ID
    const attendanceId = parseInt(params.id);
    
    if (isNaN(attendanceId)) {
      return NextResponse.json({ error: 'Invalid attendance ID' }, { status: 400 });
    }
    
    // Get attendance by ID
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });
    
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Update attendance record
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
    
    // Parse attendance ID and request body
    const attendanceId = parseInt(params.id);
    
    if (isNaN(attendanceId)) {
      return NextResponse.json({ error: 'Invalid attendance ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Format dates if they're strings
    if (typeof body.checkInTime === 'string') {
      body.checkInTime = new Date(body.checkInTime);
    }
    
    if (typeof body.checkOutTime === 'string' && body.checkOutTime) {
      body.checkOutTime = new Date(body.checkOutTime);
    } else if (body.checkOutTime === "") {
      body.checkOutTime = null;
    }
    
    if (typeof body.date === 'string') {
      body.date = new Date(body.date);
    }
    
    // Update attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: body,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedAttendance);
  } catch (error: any) {
    console.error('Error updating attendance record:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Delete attendance record
export async function DELETE(
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
    
    // Parse attendance ID
    const attendanceId = parseInt(params.id);
    
    if (isNaN(attendanceId)) {
      return NextResponse.json({ error: 'Invalid attendance ID' }, { status: 400 });
    }
    
    // Delete attendance
    await prisma.attendance.delete({
      where: { id: attendanceId }
    });
    
    return NextResponse.json({ message: 'Attendance record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting attendance record:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}