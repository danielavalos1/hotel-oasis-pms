import useSWR from "swr";
import { Room } from "@prisma/client";
import { getTodayDateString } from "@/lib/rooms/room-utils";

interface UseRoomsResult {
  rooms: Room[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Hook para obtener datos de habitaciones desde la API
 */
export function useRooms(date?: string): UseRoomsResult {
  const dateStr = date || getTodayDateString();
  
  const { data, isLoading, error, mutate } = useSWR<{ 
    success: boolean; 
    data: Room[] 
  }>(
    `/api/rooms/status?date=${dateStr}`,
    (url: string) => fetch(url).then((r) => r.json())
  );

  return {
    rooms: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
