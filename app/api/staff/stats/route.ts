import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth-options';
import { staffService } from '@/services/staffService';
import { prisma } from '@/lib/prisma';
import { EmployeeStatus, AttendanceStatus } from '@prisma/client';

export async function GET() {
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
    
    // Get basic stats
    const basicStats = await staffService.getStaffStats();
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get attendance stats for today
    const todayAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        date: {
          gte: today
        }
      }
    });
    
    // Format attendance stats
    const attendanceStats = {
      present: 0,
      absent: 0,
      late: 0,
      onLeave: 0,
      halfDay: 0
    };
    
    todayAttendance.forEach(stat => {
      switch(stat.status) {
        case AttendanceStatus.PRESENT:
          attendanceStats.present = stat._count.status;
          break;
        case AttendanceStatus.ABSENT:
          attendanceStats.absent = stat._count.status;
          break;
        case AttendanceStatus.LATE:
          attendanceStats.late = stat._count.status;
          break;
        case AttendanceStatus.ON_LEAVE:
          attendanceStats.onLeave = stat._count.status;
          break;
        case AttendanceStatus.HALF_DAY:
          attendanceStats.halfDay = stat._count.status;
          break;
      }
    });
    
    // Get employee status distribution
    const statusDistribution = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        role: {
          in: ['SUPERADMIN', 'ADMIN']
        }
      }
    });
    
    // Format employee status stats
    const employeeStatusStats = {
      active: 0,
      inactive: 0,
      onLeave: 0,
      suspended: 0,
      terminated: 0
    };
    
    statusDistribution.forEach(stat => {
      if (stat.status === null) return;
      
      switch(stat.status) {
        case EmployeeStatus.ACTIVE:
          employeeStatusStats.active = stat._count.status;
          break;
        case EmployeeStatus.INACTIVE:
          employeeStatusStats.inactive = stat._count.status;
          break;
        case EmployeeStatus.ON_LEAVE:
          employeeStatusStats.onLeave = stat._count.status;
          break;
        case EmployeeStatus.SUSPENDED:
          employeeStatusStats.suspended = stat._count.status;
          break;
        case EmployeeStatus.TERMINATED:
          employeeStatusStats.terminated = stat._count.status;
          break;
      }
    });
    
    // Get department distribution
    const departmentDistribution = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: {
              where: {
                status: EmployeeStatus.ACTIVE
              }
            }
          }
        }
      }
    });
    
    // Format department distribution
    const departmentStats = departmentDistribution.map(dept => ({
      id: dept.id,
      name: dept.name,
      count: dept._count.users
    }));
    
    // Combine all stats
    const stats = {
      ...basicStats,
      attendance: attendanceStats,
      employeeStatus: employeeStatusStats,
      departments: departmentStats
    };

    // Devolver estadísticas en un objeto
    return NextResponse.json({ stats }, { status: 200 });
  } catch (err: unknown) {
    console.error('Error fetching staff statistics:', err);
    // Devolver mensaje de error con payload válido
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}