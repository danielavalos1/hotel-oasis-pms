import { Room } from "@prisma/client";

/**
 * Ordena habitaciones por piso y número
 */
export function sortRooms(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => {
    // Primero ordenar por piso
    if (a.floor !== b.floor) return a.floor - b.floor;
    
    // Luego por número de habitación (intentar orden numérico)
    const numA = parseInt(a.roomNumber, 10);
    const numB = parseInt(b.roomNumber, 10);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Si no son números, ordenar alfabéticamente
    return a.roomNumber.localeCompare(b.roomNumber);
  });
}

/**
 * Agrupa habitaciones por piso
 */
export function groupRoomsByFloor(rooms: Room[]): Record<string, Room[]> {
  return rooms.reduce<Record<string, Room[]>>((acc, room) => {
    const floor = String(room.floor);
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});
}

/**
 * Obtiene los pisos ordenados de menor a mayor
 */
export function getSortedFloors(groupedRooms: Record<string, Room[]>): string[] {
  return Object.keys(groupedRooms).sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Procesa habitaciones: ordena y agrupa por piso
 */
export function processRoomsForDisplay(rooms: Room[]): {
  sortedRooms: Room[];
  groupedRooms: Record<string, Room[]>;
  sortedFloors: string[];
} {
  const sortedRooms = sortRooms(rooms);
  const groupedRooms = groupRoomsByFloor(sortedRooms);
  const sortedFloors = getSortedFloors(groupedRooms);
  
  return {
    sortedRooms,
    groupedRooms,
    sortedFloors,
  };
}
