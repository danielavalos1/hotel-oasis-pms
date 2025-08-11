import { Room } from "@prisma/client";

export interface RoomFilters {
  searchQuery?: string;
  floorFilter?: string;
  typeFilter?: string;
}

/**
 * Filtra habitaciones por búsqueda de texto
 */
export function filterBySearch(rooms: Room[], searchQuery: string): Room[] {
  if (!searchQuery.trim()) return rooms;
  
  const query = searchQuery.toLowerCase();
  return rooms.filter(
    (room) =>
      room.roomNumber.toLowerCase().includes(query) ||
      room.type.toLowerCase().includes(query) ||
      room.amenities.some((amenity) => amenity.toLowerCase().includes(query))
  );
}

/**
 * Filtra habitaciones por piso
 */
export function filterByFloor(rooms: Room[], floorFilter: string): Room[] {
  if (floorFilter === "all") return rooms;
  
  return rooms.filter((room) => String(room.floor) === floorFilter);
}

/**
 * Filtra habitaciones por tipo
 */
export function filterByType(rooms: Room[], typeFilter: string): Room[] {
  if (typeFilter === "all") return rooms;
  
  return rooms.filter((room) => room.type === typeFilter);
}

/**
 * Aplica todos los filtros a una lista de habitaciones
 */
export function applyRoomFilters(rooms: Room[], filters: RoomFilters): Room[] {
  let filteredRooms = rooms;
  
  if (filters.searchQuery) {
    filteredRooms = filterBySearch(filteredRooms, filters.searchQuery);
  }
  
  if (filters.floorFilter) {
    filteredRooms = filterByFloor(filteredRooms, filters.floorFilter);
  }
  
  if (filters.typeFilter) {
    filteredRooms = filterByType(filteredRooms, filters.typeFilter);
  }
  
  return filteredRooms;
}
