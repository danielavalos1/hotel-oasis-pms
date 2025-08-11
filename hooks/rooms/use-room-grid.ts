import { useMemo } from "react";
import { Room } from "@prisma/client";
import { useRooms } from "./use-rooms";
import { useRoomFilters } from "./use-room-filters";
import { useRoomGrouping } from "./use-room-grouping";
import { useRoomUpdates } from "./use-room-updates";
import { RoomFilters } from "@/lib/rooms/room-filters";
import { logRoomData } from "@/lib/rooms/room-utils";

interface UseRoomGridResult {
  // Datos procesados
  displayRooms: Room[];
  groupedRooms: Record<string, Room[]>;
  sortedFloors: string[];
  
  // Estados
  isLoading: boolean;
  error: any;
  isUpdating: boolean;
  
  // Métricas
  totalRooms: number;
  filteredCount: number;
  filterCount: number;
  
  // Acciones
  updateRoom: (roomId: number, data: { floor: number; status: any }) => Promise<void>;
  resetLocalChanges: () => void;
  refreshData: () => void;
}

/**
 * Hook principal para la grilla de habitaciones
 * Combina todos los hooks específicos y proporciona una API unificada
 */
export function useRoomGrid(
  filters: RoomFilters,
  date?: string
): UseRoomGridResult {
  // Obtener datos de la API
  const { rooms: apiRooms, isLoading, error, mutate } = useRooms(date);
  
  // Manejar actualizaciones locales
  const { localRooms, isUpdating, updateRoom, resetLocalChanges } = useRoomUpdates(apiRooms);
  
  // Determinar qué datos usar (locales o de API)
  const currentRooms = useMemo(() => {
    const roomsToUse = localRooms.length > 0 ? localRooms : apiRooms;
    logRoomData("Data recibida de /api/rooms/status", roomsToUse);
    return roomsToUse;
  }, [localRooms, apiRooms]);
  
  // Aplicar filtros
  const { filteredRooms, filterCount } = useRoomFilters(currentRooms, filters);
  
  // Agrupar y ordenar
  const { groupedRooms, sortedFloors, totalRooms } = useRoomGrouping(filteredRooms);
  
  // Log de datos filtrados
  logRoomData("Data mostrada en grid", filteredRooms);
  
  return {
    // Datos procesados
    displayRooms: filteredRooms,
    groupedRooms,
    sortedFloors,
    
    // Estados
    isLoading,
    error,
    isUpdating,
    
    // Métricas
    totalRooms,
    filteredCount: filteredRooms.length,
    filterCount,
    
    // Acciones
    updateRoom,
    resetLocalChanges,
    refreshData: mutate,
  };
}
