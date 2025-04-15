import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth-options';
import { staffService, AttendanceInput } from '@/services/staffService';

// Get attendance records
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
    const dateParam = url.searchParams.get('date');
    const userIdParam = url.searchParams.get('userId');
    
    // Get attendance based on parameters
    if (dateParam) {
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      
      const attendanceRecords = await staffService.getAttendanceByDate(date);
      return NextResponse.json(attendanceRecords);
    } 
    else if (userIdParam) {
      const userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
      
      const startDateParam = url.searchParams.get('startDate');
      const endDateParam = url.searchParams.get('endDate');
      
      let startDate, endDate;
      
      if (startDateParam) {
        startDate = new Date(startDateParam);
        if (isNaN(startDate.getTime())) {
          return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 });
        }
      }
      
      if (endDateParam) {
        endDate = new Date(endDateParam);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json({ error: 'Invalid end date format' }, { status: 400 });
        }
      }
      
      const attendanceRecords = await staffService.getAttendanceByStaffId(
        userId, 
        startDate, 
        endDate
      );
      return NextResponse.json(attendanceRecords);
    }
    
    // If no specific parameters, return error
    return NextResponse.json(
      { error: 'Missing required query parameters: date or userId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Register attendance
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
    const requiredFields = ['userId', 'checkInTime', 'status'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` }, 
          { status: 400 }
        );
      }
    }
    
    // Format dates if they're strings
    if (typeof body.checkInTime === 'string') {
      body.checkInTime = new Date(body.checkInTime);
    }
    
    if (typeof body.checkOutTime === 'string' && body.checkOutTime) {
      body.checkOutTime = new Date(body.checkOutTime);
    }
    
    if (typeof body.date === 'string') {
      body.date = new Date(body.date);
    } else if (!body.date) {
      // If date is not provided, use the current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      body.date = today;
    }
    
    // Register attendance
    const attendance = await staffService.registerAttendance(body as AttendanceInput);
    
    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    console.error('Error registering attendance:', error);
    
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