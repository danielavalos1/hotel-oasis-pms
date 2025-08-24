import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  departments: number;
  pendingDocuments: number;
}

interface UseStaffStatsResult {
  stats: StaffStats | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Hook para obtener estadísticas del personal
 */
export function useStaffStats(): UseStaffStatsResult {
  const { data, error, isLoading, mutate } = useSWR<StaffStats>(
    "/api/staff/stats",
    fetcher
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}
