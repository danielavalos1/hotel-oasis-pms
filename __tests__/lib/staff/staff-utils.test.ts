import { formatStaffName, formatStaffPosition, getStaffExperience, sortStaffByName, sortStaffByHireDate } from '../../../lib/staff/staff-utils';
import { User, EmployeeStatus } from '@prisma/client';

// Mock data
const mockStaff: User[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Admin',
    lastName: 'User',
    passwordHash: 'hash',
    email: 'admin@hotel.com',
    role: 'ADMIN',
    departmentId: 1,
    position: 'Administrator',
    hireDate: new Date('2023-01-01'),
    status: 'ACTIVE' as EmployeeStatus,
  },
  {
    id: 2,
    username: 'recep1',
    name: 'Maria',
    lastName: 'Garcia',
    passwordHash: 'hash',
    email: 'maria@hotel.com',
    role: 'RECEPTIONIST',
    departmentId: 2,
    position: 'Receptionist',
    hireDate: new Date('2023-06-01'),
    status: 'ACTIVE' as EmployeeStatus,
  },
  {
    id: 3,
    username: 'house1',
    name: 'Carlos',
    lastName: 'Martinez',
    passwordHash: 'hash',
    email: 'carlos@hotel.com',
    role: 'HOUSEKEEPER',
    departmentId: 3,
    position: 'Housekeeper',
    hireDate: new Date('2022-03-01'),
    status: 'INACTIVE' as EmployeeStatus,
  },
];

describe('Staff Utils', () => {
  describe('formatStaffName', () => {
    test('should format full name correctly', () => {
      const result = formatStaffName(mockStaff[0]);
      expect(result).toBe('Admin User');
    });

    test('should handle missing names gracefully', () => {
      const staffWithoutLastName = { ...mockStaff[0], lastName: '' };
      const result = formatStaffName(staffWithoutLastName);
      expect(result).toBe('Admin');
    });

    test('should handle both missing names', () => {
      const staffWithoutNames = { ...mockStaff[0], name: '', lastName: '' };
      const result = formatStaffName(staffWithoutNames);
      expect(result).toBe('');
    });
  });

  describe('formatStaffPosition', () => {
    test('should format position and role correctly', () => {
      const result = formatStaffPosition(mockStaff[0]);
      expect(result).toBe('Administrator (ADMIN)');
    });

    test('should handle missing position', () => {
      const staffWithoutPosition = { ...mockStaff[0], position: null };
      const result = formatStaffPosition(staffWithoutPosition);
      expect(result).toBe('(ADMIN)');
    });

    test('should handle missing role', () => {
      const staffWithoutRole = { ...mockStaff[0], role: null };
      const result = formatStaffPosition(staffWithoutRole);
      expect(result).toBe('Administrator');
    });
  });

  describe('getStaffExperience', () => {
    test('should calculate experience in years correctly', () => {
      // Using a fixed date for consistent testing - use a date that ensures full 2 years difference
      const fixedDate = new Date('2024-02-01');
      const staffHiredJan2022 = { ...mockStaff[0], hireDate: new Date('2022-01-01') };
      
      const result = getStaffExperience(staffHiredJan2022, fixedDate);
      expect(result).toBe(2);
    });

    test('should handle less than one year experience', () => {
      const fixedDate = new Date('2023-06-01');
      const staffHiredJan2023 = { ...mockStaff[0], hireDate: new Date('2023-01-01') };
      
      const result = getStaffExperience(staffHiredJan2023, fixedDate);
      expect(result).toBe(0);
    });

    test('should handle future hire dates', () => {
      const fixedDate = new Date('2023-01-01');
      const staffHiredFuture = { ...mockStaff[0], hireDate: new Date('2023-06-01') };
      
      const result = getStaffExperience(staffHiredFuture, fixedDate);
      expect(result).toBe(0);
    });
  });

  describe('sortStaffByName', () => {
    test('should sort staff by name in ascending order', () => {
      const result = sortStaffByName([...mockStaff], 'asc');
      expect(result[0].name).toBe('Admin');
      expect(result[1].name).toBe('Carlos');
      expect(result[2].name).toBe('Maria');
    });

    test('should sort staff by name in descending order', () => {
      const result = sortStaffByName([...mockStaff], 'desc');
      expect(result[0].name).toBe('Maria');
      expect(result[1].name).toBe('Carlos');
      expect(result[2].name).toBe('Admin');
    });

    test('should not mutate original array', () => {
      const originalStaff = [...mockStaff];
      const result = sortStaffByName(mockStaff, 'asc');
      expect(mockStaff).not.toBe(result);
      expect(mockStaff).toEqual(originalStaff);
    });
  });

  describe('sortStaffByHireDate', () => {
    test('should sort staff by hire date in ascending order (oldest first)', () => {
      const result = sortStaffByHireDate([...mockStaff], 'asc');
      // Expected order: Carlos (2022-03-01) → Admin (2023-01-01) → Maria (2023-06-01)
      expect(result[0].name).toBe('Carlos'); // Oldest
      expect(result[1].name).toBe('Admin'); // Middle
      expect(result[2].name).toBe('Maria'); // Newest
    });

    test('should sort staff by hire date in descending order (newest first)', () => {
      const result = sortStaffByHireDate([...mockStaff], 'desc');
      // Expected order: Maria (2023-06-01) → Admin (2023-01-01) → Carlos (2022-03-01)
      expect(result[0].name).toBe('Maria'); // Newest 
      expect(result[1].name).toBe('Admin'); // Middle
      expect(result[2].name).toBe('Carlos'); // Oldest
    });

    test('should not mutate original array', () => {
      const originalStaff = [...mockStaff];
      const result = sortStaffByHireDate(mockStaff, 'asc');
      expect(mockStaff).not.toBe(result);
      expect(mockStaff).toEqual(originalStaff);
    });
  });
});
