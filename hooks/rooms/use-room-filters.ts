import { useMemo } from "react";
import { Room } from "@prisma/client";
import { applyRoomFilters, RoomFilters } from "@/lib/rooms/room-filters";

interface UseRoomFiltersResult {
  filteredRooms: Room[];
  filterCount: number;
}

/**
 * Hook para aplicar filtros a las habitaciones
 */
export function useRoomFilters(
  rooms: Room[], 
  filters: RoomFilters
): UseRoomFiltersResult {
  const filteredRooms = useMemo(() => {
    return applyRoomFilters(rooms, filters);
  }, [rooms, filters]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery?.trim()) count++;
    if (filters.floorFilter && filters.floorFilter !== "all") count++;
    if (filters.typeFilter && filters.typeFilter !== "all") count++;
    return count;
  }, [filters]);

  return {
    filteredRooms,
    filterCount,
  };
}
