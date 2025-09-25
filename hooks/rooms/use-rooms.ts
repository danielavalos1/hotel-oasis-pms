import useSWR from "swr";
import { Room } from "@prisma/client";
import { RoomWithDetails } from "@/types/room";
import { getTodayDateString } from "@/lib/rooms/room-utils";
import { fetcher } from "@/lib/fetcher";

interface UseRoomsResult {
  rooms: Room[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

interface UseAllRoomsResult {
  rooms: RoomWithDetails[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
  refresh: () => void;
}

/**
 * Hook para obtener datos de habitaciones con estado desde la API
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

/**
 * Hook para obtener todas las habitaciones con detalles completos
 */
export function useAllRooms(): UseAllRoomsResult {
  const { data, error, isLoading, mutate } = useSWR<RoomWithDetails[]>(
    '/api/rooms?withDetails=true',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache for 10 seconds
    }
  );

  return {
    rooms: data || [],
    isLoading,
    error,
    mutate,
    refresh: () => mutate(),
  };
}
