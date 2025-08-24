import { useMemo } from "react";
import { useStaff } from "./use-staff";
import { useStaffStats } from "./use-staff-stats";
import { useDepartments } from "./use-departments";
import { useStaffFilters, StaffFilters } from "./use-staff-filters";
import { groupStaffByDepartment, sortStaff } from "@/lib/staff/staff-utils";

interface UseStaffManagementResult {
  // Datos principales
  staff: any[] | undefined;
  stats: any | undefined;
  departments: any[] | undefined;
  
  // Datos procesados
  filteredStaff: any[];
  groupedStaff: Record<string, any[]>;
  sortedStaff: any[];
  
  // Estados
  isLoading: boolean;
  error: any;
  
  // Métricas
  totalStaff: number;
  filteredCount: number;
  
  // Acciones
  refreshData: () => void;
}

/**
 * Hook principal para gestión de personal
 * Combina todos los hooks específicos y proporciona una API unificada
 */
export function useStaffManagement(
  filters: StaffFilters,
  sortBy: "name" | "position" | "hireDate" | "department" = "name"
): UseStaffManagementResult {
  // Obtener datos de la API
  const { staff, isLoading: staffLoading, error: staffError, mutate: mutateStaff } = useStaff();
  const { stats, isLoading: statsLoading, error: statsError, mutate: mutateStats } = useStaffStats();
  const { departments, isLoading: deptLoading, error: deptError, mutate: mutateDepts } = useDepartments();
  
  // Estados combinados
  const isLoading = staffLoading || statsLoading || deptLoading;
  const error = staffError || statsError || deptError;
  
  // Aplicar filtros
  const { filteredStaff, filterCount } = useStaffFilters(staff || [], filters);
  
  // Procesar datos
  const processedData = useMemo(() => {
    if (!filteredStaff || !departments) {
      return {
        groupedStaff: {},
        sortedStaff: [],
      };
    }

    const sorted = sortStaff(filteredStaff, sortBy);
    const grouped = groupStaffByDepartment(filteredStaff, departments);

    return {
      groupedStaff: grouped,
      sortedStaff: sorted,
    };
  }, [filteredStaff, departments, sortBy]);
  
  // Función para refrescar todos los datos
  const refreshData = () => {
    mutateStaff();
    mutateStats();
    mutateDepts();
  };
  
  return {
    // Datos principales
    staff,
    stats,
    departments,
    
    // Datos procesados
    filteredStaff,
    groupedStaff: processedData.groupedStaff,
    sortedStaff: processedData.sortedStaff,
    
    // Estados
    isLoading,
    error,
    
    // Métricas
    totalStaff: staff?.length || 0,
    filteredCount: filterCount,
    
    // Acciones
    refreshData,
  };
}
