import { prisma } from "@/lib/prisma";
import { 
  EmployeeStatus, 
  UserRole,
  AttendanceStatus,
  Prisma
} from "@prisma/client";

export type StaffCreateInput = {
  username: string;
  name: string;
  lastName?: string;
  email: string;
  password: string; // Plain password to be hashed
  role: UserRole;
  departmentId?: number;
  position?: string;
  hireDate?: Date;
}

export type StaffUpdateInput = {
  name?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  departmentId?: number;
  position?: string;
  status?: EmployeeStatus;
  hireDate?: Date;
}

export type AttendanceInput = {
  userId: number;
  checkInTime: Date;
  checkOutTime?: Date;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

export type ScheduleInput = {
  userId: number;
  startTime: Date;
  endTime: Date;
  dayOfWeek: number;
  isRecurring?: boolean;
}

export type DocumentInput = {
  userId: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  expiryDate?: Date;
}

export type DepartmentInput = {
  name: string;
  description?: string;
}

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  // In a real application, use bcrypt or similar
  // For this example, we'll use a simple hash (NOT RECOMMENDED FOR PRODUCTION)
  return Buffer.from(password).toString('base64');
}

// Staff Management Service
export const staffService = {
  // Get all staff members with optional filters
  getAllStaff: async (filters?: { 
    status?: EmployeeStatus,
    role?: UserRole, 
    departmentId?: number 
  }) => {
    const where: Prisma.UserWhereInput = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.role) {
      where.role = filters.role;
    }
    
    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }
    
    return prisma.user.findMany({
      where,
      include: {
        department: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },
  
  // Get staff member by ID
  getStaffById: async (id: number) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        schedules: true,
        documents: true,
        attendance: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    });
  },
  
  // Create new staff member
  createStaff: async (data: StaffCreateInput) => {
    const passwordHash = await hashPassword(data.password);
    
    return prisma.user.create({
      data: {
        username: data.username,
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role,
        departmentId: data.departmentId,
        position: data.position,
        hireDate: data.hireDate,
        status: EmployeeStatus.ACTIVE
      }
    });
  },
  
  // Update staff member
  updateStaff: async (id: number, data: StaffUpdateInput) => {
    return prisma.user.update({
      where: { id },
      data
    });
  },
  
  // Change staff status (activate, deactivate, put on leave, etc.)
  changeStaffStatus: async (id: number, status: EmployeeStatus) => {
    return prisma.user.update({
      where: { id },
      data: { status }
    });
  },
  
  // Get staff statistics for dashboard
  getStaffStats: async () => {
    const [totalStaff, activeStaff, departments, pendingDocuments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: EmployeeStatus.ACTIVE } }),
      prisma.department.count(),
      prisma.employeeDocument.count({
        where: {
          expiryDate: {
            lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Less than 30 days from now
          }
        }
      })
    ]);
    
    return {
      totalStaff,
      activeStaff,
      departments,
      pendingDocuments
    };
  },
  
  // Attendance management
  registerAttendance: async (data: AttendanceInput) => {
    return prisma.attendance.create({
      data
    });
  },
  
  updateAttendance: async (id: number, data: Partial<AttendanceInput>) => {
    return prisma.attendance.update({
      where: { id },
      data
    });
  },
  
  getAttendanceByDate: async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        user: true
      }
    });
  },
  
  getAttendanceByStaffId: async (userId: number, startDate?: Date, endDate?: Date) => {
    const where: Prisma.AttendanceWhereInput = { userId };
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    return prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });
  },
  
  // Schedule management
  createSchedule: async (data: ScheduleInput) => {
    return prisma.schedule.create({
      data
    });
  },
  
  updateSchedule: async (id: number, data: Partial<ScheduleInput>) => {
    return prisma.schedule.update({
      where: { id },
      data
    });
  },
  
  deleteSchedule: async (id: number) => {
    return prisma.schedule.delete({
      where: { id }
    });
  },
  
  getSchedulesByStaffId: async (userId: number) => {
    return prisma.schedule.findMany({
      where: { userId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            department: true
          }
        }
      }
    });
  },
  
  getScheduleById: async (id: number) => {
    return prisma.schedule.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            department: true
          }
        }
      }
    });
  },
  
  getAllSchedules: async () => {
    return prisma.schedule.findMany({
      orderBy: [
        { userId: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            department: true
          }
        }
      }
    });
  },
  
  // Document management
  addDocument: async (data: DocumentInput) => {
    return prisma.employeeDocument.create({
      data: {
        ...data,
        uploadDate: new Date()
      }
    });
  },
  
  updateDocument: async (id: number, data: Partial<DocumentInput>) => {
    return prisma.employeeDocument.update({
      where: { id },
      data
    });
  },
  
  deleteDocument: async (id: number) => {
    return prisma.employeeDocument.delete({
      where: { id }
    });
  },
  
  getDocumentsByStaffId: async (userId: number) => {
    return prisma.employeeDocument.findMany({
      where: { userId }
    });
  },
  
  // Department management
  createDepartment: async (data: DepartmentInput) => {
    return prisma.department.create({
      data
    });
  },
  
  updateDepartment: async (id: number, data: Partial<DepartmentInput>) => {
    return prisma.department.update({
      where: { id },
      data
    });
  },
  
  deleteDepartment: async (id: number) => {
    // First check if any users are assigned to this department
    const usersInDepartment = await prisma.user.count({
      where: { departmentId: id }
    });
    
    if (usersInDepartment > 0) {
      throw new Error(`Cannot delete department with ${usersInDepartment} staff members assigned`);
    }
    
    return prisma.department.delete({
      where: { id }
    });
  },
  
  getAllDepartments: async () => {
    return prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },
  
  getDepartmentById: async (id: number) => {
    return prisma.department.findUnique({
      where: { id },
      include: {
        users: true
      }
    });
  }
};