import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Booking } from "@prisma/client";

interface UseBookingsResult {
  bookings: Booking[] | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Hook para obtener lista de reservas
 */
export function useBookings(): UseBookingsResult {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    "/api/bookings",
    fetcher
  );

  return {
    bookings: data,
    isLoading,
    error,
    mutate,
  };
}
