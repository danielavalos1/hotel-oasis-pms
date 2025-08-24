import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Department } from "@prisma/client";

interface UseDepartmentsResult {
  departments: Department[] | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Hook para obtener lista de departamentos
 */
export function useDepartments(): UseDepartmentsResult {
  const { data, error, isLoading, mutate } = useSWR<Department[]>(
    "/api/staff/departments",
    fetcher
  );

  return {
    departments: data,
    isLoading,
    error,
    mutate,
  };
}
