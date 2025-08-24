import { User } from "@prisma/client";

/**
 * Filtra personal por búsqueda de texto
 */
export function filterStaffBySearch(staff: User[], searchQuery: string): User[] {
  if (!searchQuery.trim()) return staff;

  const query = searchQuery.toLowerCase();
  return staff.filter(
    (member) =>
      member.name.toLowerCase().includes(query) ||
      member.lastName?.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.username.toLowerCase().includes(query) ||
      member.position?.toLowerCase().includes(query)
  );
}

/**
 * Filtra personal por estado
 */
export function filterStaffByStatus(staff: User[], status: string): User[] {
  if (status === "all") return staff;
  return staff.filter((member) => member.status === status);
}

/**
 * Filtra personal por departamento
 */
export function filterStaffByDepartment(staff: User[], departmentId: string): User[] {
  if (departmentId === "all") return staff;
  return staff.filter((member) => member.departmentId?.toString() === departmentId);
}

/**
 * Aplica todos los filtros de personal
 */
export function applyStaffFilters(
  staff: User[],
  filters: {
    searchQuery: string;
    statusFilter: string;
    departmentFilter: string;
  }
): User[] {
  let result = staff;

  if (filters.searchQuery) {
    result = filterStaffBySearch(result, filters.searchQuery);
  }

  if (filters.statusFilter !== "all") {
    result = filterStaffByStatus(result, filters.statusFilter);
  }

  if (filters.departmentFilter !== "all") {
    result = filterStaffByDepartment(result, filters.departmentFilter);
  }

  return result;
}
