import { filterStaffBySearch, filterStaffByStatus, filterStaffByDepartment, applyStaffFilters } from '@/lib/staff/staff-filters';
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
    hireDate: new Date('2023-03-01'),
    status: 'INACTIVE' as EmployeeStatus,
  },
];

describe('Staff Filters', () => {
  describe('filterStaffBySearch', () => {
    test('should return all staff when search query is empty', () => {
      const result = filterStaffBySearch(mockStaff, '');
      expect(result.length).toBe(mockStaff.length);
    });

    test('should filter staff by name', () => {
      const result = filterStaffBySearch(mockStaff, 'maria');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Maria');
    });

    test('should filter staff by last name', () => {
      const result = filterStaffBySearch(mockStaff, 'garcia');
      expect(result.length).toBe(1);
      expect(result[0].lastName).toBe('Garcia');
    });

    test('should filter staff by email', () => {
      const result = filterStaffBySearch(mockStaff, 'admin@hotel.com');
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('admin@hotel.com');
    });

    test('should filter staff by username', () => {
      const result = filterStaffBySearch(mockStaff, 'recep1');
      expect(result.length).toBe(1);
      expect(result[0].username).toBe('recep1');
    });

    test('should filter staff by position', () => {
      const result = filterStaffBySearch(mockStaff, 'receptionist');
      expect(result.length).toBe(1);
      expect(result[0].position).toBe('Receptionist');
    });

    test('should be case insensitive', () => {
      const result = filterStaffBySearch(mockStaff, 'MARIA');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Maria');
    });

    test('should return empty array when no matches found', () => {
      const result = filterStaffBySearch(mockStaff, 'nonexistent');
      expect(result.length).toBe(0);
    });
  });

  describe('filterStaffByStatus', () => {
    test('should return all staff when status is "all"', () => {
      const result = filterStaffByStatus(mockStaff, 'all');
      expect(result.length).toBe(mockStaff.length);
    });

    test('should filter staff by ACTIVE status', () => {
      const result = filterStaffByStatus(mockStaff, 'ACTIVE');
      expect(result.length).toBe(2);
      expect(result.every(staff => staff.status === 'ACTIVE')).toBe(true);
    });

    test('should filter staff by INACTIVE status', () => {
      const result = filterStaffByStatus(mockStaff, 'INACTIVE');
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('INACTIVE');
    });
  });

  describe('filterStaffByDepartment', () => {
    test('should return all staff when department is "all"', () => {
      const result = filterStaffByDepartment(mockStaff, 'all');
      expect(result.length).toBe(mockStaff.length);
    });

    test('should filter staff by department ID', () => {
      const result = filterStaffByDepartment(mockStaff, '1');
      expect(result.length).toBe(1);
      expect(result[0].departmentId).toBe(1);
    });

    test('should filter staff by different department ID', () => {
      const result = filterStaffByDepartment(mockStaff, '2');
      expect(result.length).toBe(1);
      expect(result[0].departmentId).toBe(2);
    });
  });

  describe('applyStaffFilters', () => {
    test('should apply all filters together', () => {
      const filters = {
        searchQuery: 'maria',
        statusFilter: 'ACTIVE',
        departmentFilter: '2',
      };

      const result = applyStaffFilters(mockStaff, filters);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Maria');
      expect(result[0].status).toBe('ACTIVE');
      expect(result[0].departmentId).toBe(2);
    });

    test('should return empty array when filters do not match', () => {
      const filters = {
        searchQuery: 'maria',
        statusFilter: 'INACTIVE',
        departmentFilter: 'all',
      };

      const result = applyStaffFilters(mockStaff, filters);
      expect(result.length).toBe(0);
    });

    test('should ignore empty search query', () => {
      const filters = {
        searchQuery: '',
        statusFilter: 'ACTIVE',
        departmentFilter: 'all',
      };

      const result = applyStaffFilters(mockStaff, filters);
      expect(result.length).toBe(2);
      expect(result.every(staff => staff.status === 'ACTIVE')).toBe(true);
    });
  });
});
