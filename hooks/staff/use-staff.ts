import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { User } from "@prisma/client";

interface UseStaffResult {
  staff: User[] | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Hook para obtener lista del personal
 */
export function useStaff(): UseStaffResult {
  const { data, error, isLoading, mutate } = useSWR<User[]>(
    "/api/staff",
    fetcher
  );

  return {
    staff: data,
    isLoading,
    error,
    mutate,
  };
}
