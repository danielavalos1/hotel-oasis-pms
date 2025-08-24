import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Guest } from "@prisma/client";

interface UseGuestsResult {
  guests: Guest[] | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Hook para obtener lista de huéspedes
 */
export function useGuests(): UseGuestsResult {
  const { data, error, isLoading, mutate } = useSWR<Guest[]>(
    "/api/guests",
    fetcher
  );

  return {
    guests: data,
    isLoading,
    error,
    mutate,
  };
}
