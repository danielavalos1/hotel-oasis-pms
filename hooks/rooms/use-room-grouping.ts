import { useMemo } from "react";
import { Room } from "@prisma/client";
import { processRoomsForDisplay } from "@/lib/rooms/room-sorting";

interface UseRoomGroupingResult {
  sortedRooms: Room[];
  groupedRooms: Record<string, Room[]>;
  sortedFloors: string[];
  totalRooms: number;
}

/**
 * Hook para agrupar y ordenar habitaciones
 */
export function useRoomGrouping(rooms: Room[]): UseRoomGroupingResult {
  const processedData = useMemo(() => {
    return processRoomsForDisplay(rooms);
  }, [rooms]);

  return {
    ...processedData,
    totalRooms: rooms.length,
  };
}
