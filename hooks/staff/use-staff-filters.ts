import { useMemo } from "react";
import { User } from "@prisma/client";
import { filterStaffByStatus, filterStaffByDepartment, filterStaffBySearch } from "@/lib/staff/staff-filters";

export interface StaffFilters {
  searchQuery: string;
  statusFilter: string;
  departmentFilter: string;
}

interface UseStaffFiltersResult {
  filteredStaff: User[];
  filterCount: number;
}

/**
 * Hook para filtrar personal
 */
export function useStaffFilters(
  staff: User[],
  filters: StaffFilters
): UseStaffFiltersResult {
  const filteredStaff = useMemo(() => {
    if (!staff) return [];

    let result = staff;

    // Aplicar filtros en secuencia
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
  }, [staff, filters]);

  return {
    filteredStaff,
    filterCount: filteredStaff.length,
  };
}
