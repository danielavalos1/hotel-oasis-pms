import { User, Department } from "@prisma/client";

/**
 * Agrupa personal por departamento
 */
export function groupStaffByDepartment(
  staff: User[],
  departments: Department[]
): Record<string, User[]> {
  const grouped: Record<string, User[]> = {};

  // Inicializar grupos con departamentos
  departments.forEach((dept) => {
    grouped[dept.name] = [];
  });

  // Agregar grupo para personal sin departamento
  grouped["Sin Departamento"] = [];

  // Agrupar personal
  staff.forEach((member) => {
    const department = departments.find((dept) => dept.id === member.departmentId);
    const groupKey = department ? department.name : "Sin Departamento";
    grouped[groupKey].push(member);
  });

  return grouped;
}

/**
 * Ordena personal por diferentes criterios
 */
export function sortStaff(
  staff: User[],
  sortBy: "name" | "position" | "hireDate" | "department" = "name"
): User[] {
  return [...staff].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "position":
        return (a.position || "").localeCompare(b.position || "");
      case "hireDate":
        if (!a.hireDate && !b.hireDate) return 0;
        if (!a.hireDate) return 1;
        if (!b.hireDate) return -1;
        return new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
      case "department":
        return (a.departmentId || 0) - (b.departmentId || 0);
      default:
        return 0;
    }
  });
}

/**
 * Obtiene estadísticas de personal
 */
export function calculateStaffStats(staff: User[]): {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Record<string, number>;
  byRole: Record<string, number>;
} {
  const stats = {
    total: staff.length,
    active: staff.filter((m) => m.status === "ACTIVE").length,
    inactive: staff.filter((m) => m.status !== "ACTIVE").length,
    byDepartment: {} as Record<string, number>,
    byRole: {} as Record<string, number>,
  };

  // Contar por departamento
  staff.forEach((member) => {
    const deptKey = member.departmentId?.toString() || "sin-departamento";
    stats.byDepartment[deptKey] = (stats.byDepartment[deptKey] || 0) + 1;
  });

  // Contar por rol
  staff.forEach((member) => {
    stats.byRole[member.role] = (stats.byRole[member.role] || 0) + 1;
  });

  return stats;
}

/**
 * Formatea el nombre completo del personal
 */
export function formatStaffName(staff: User): string {
  const parts = [staff.name, staff.lastName].filter(Boolean);
  return parts.join(' ').trim();
}

/**
 * Formatea la posición y rol del personal
 */
export function formatStaffPosition(staff: User): string {
  const parts = [];
  if (staff.position) parts.push(staff.position);
  if (staff.role) parts.push(`(${staff.role})`);
  return parts.join(' ').trim();
}

/**
 * Calcula la experiencia en años del personal
 */
export function getStaffExperience(staff: User, currentDate = new Date()): number {
  if (!staff.hireDate) return 0;
  
  const hireDate = new Date(staff.hireDate);
  const diffTime = currentDate.getTime() - hireDate.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  
  return Math.max(0, Math.floor(diffYears));
}

/**
 * Ordena personal por nombre
 */
export function sortStaffByName(staff: User[], direction: 'asc' | 'desc' = 'asc'): User[] {
  return [...staff].sort((a, b) => {
    const nameA = formatStaffName(a).toLowerCase();
    const nameB = formatStaffName(b).toLowerCase();
    
    if (direction === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
}

/**
 * Ordena personal por fecha de contratación
 */
export function sortStaffByHireDate(staff: User[], direction: 'asc' | 'desc' = 'asc'): User[] {
  return [...staff].sort((a, b) => {
    const dateA = a.hireDate ? new Date(a.hireDate).getTime() : 0;
    const dateB = b.hireDate ? new Date(b.hireDate).getTime() : 0;
    
    if (direction === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });
}
