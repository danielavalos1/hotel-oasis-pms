import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth-options';
import { staffService, ScheduleInput } from '@/services/staffService';

// Get all schedules
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
    const userId = url.searchParams.get('userId') 
      ? parseInt(url.searchParams.get('userId')!) 
      : undefined;
    
    // Get schedules based on whether userId is provided
    let schedules;
    if (userId) {
      schedules = await staffService.getSchedulesByStaffId(userId);
    } else {
      schedules = await staffService.getAllSchedules();
    }
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Create new schedule
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
    const requiredFields = ['userId', 'startTime', 'endTime', 'dayOfWeek'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` }, 
          { status: 400 }
        );
      }
    }

    // Format dates if they're strings
    if (typeof body.startTime === 'string') {
      body.startTime = new Date(body.startTime);
    }
    
    if (typeof body.endTime === 'string') {
      body.endTime = new Date(body.endTime);
    }
    
    // Create schedule
    const schedule = await staffService.createSchedule(body as ScheduleInput);
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Staff member not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}