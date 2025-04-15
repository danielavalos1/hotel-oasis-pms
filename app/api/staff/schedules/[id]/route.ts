import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/auth-options';
import { staffService } from '@/services/staffService';

// Get schedule by ID
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
    
    // Parse schedule ID
    const scheduleId = parseInt(params.id);
    
    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }
    
    // Get schedule by ID
    const schedule = await staffService.getScheduleById(scheduleId);
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Update schedule
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
    
    // Parse schedule ID and request body
    const scheduleId = parseInt(params.id);
    
    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Format dates if they're strings
    if (typeof body.startTime === 'string') {
      body.startTime = new Date(body.startTime);
    }
    
    if (typeof body.endTime === 'string') {
      body.endTime = new Date(body.endTime);
    }
    
    // Update schedule
    const updatedSchedule = await staffService.updateSchedule(scheduleId, body);
    
    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Delete schedule
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
    
    // Parse schedule ID
    const scheduleId = parseInt(params.id);
    
    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }
    
    // Delete schedule
    await staffService.deleteSchedule(scheduleId);
    
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}