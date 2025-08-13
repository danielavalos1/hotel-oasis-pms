// __tests__/lib/rooms/room-filters.test.ts
// Tests para funciones puras de filtrado

import { 
  applyRoomFilters, 
  filterBySearch, 
  filterByFloor, 
  filterByType 
} from '@/lib/rooms/room-filters';
import { Room, RoomType, RoomStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock data para tests
const mockRooms: Room[] = [
  {
    id: 1,
    roomNumber: '101',
    type: 'SENCILLA' as RoomType,
    capacity: 2,
    pricePerNight: new Decimal(1200),
    description: 'Habitación sencilla',
    amenities: ['wifi', 'tv'],
    isAvailable: true,
    status: 'LIBRE' as RoomStatus,
    floor: 1,
  },
  {
    id: 2,
    roomNumber: '102',
    type: 'DOBLE' as RoomType,
    capacity: 4,
    pricePerNight: new Decimal(1800),
    description: 'Habitación doble con vista',
    amenities: ['wifi', 'tv', 'ac'],
    isAvailable: false,
    status: 'OCUPADA' as RoomStatus,
    floor: 1,
  },
  {
    id: 3,
    roomNumber: '201',
    type: 'SUITE_A' as RoomType,
    capacity: 6,
    pricePerNight: new Decimal(3500),
    description: 'Suite ejecutiva',
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    isAvailable: false,
    status: 'EN_MANTENIMIENTO' as RoomStatus,
    floor: 2,
  },
];

describe('Room Filters', () => {
  describe('filterBySearch', () => {
    it('should filter rooms by room number', () => {
      const result = filterBySearch(mockRooms, '101');
      
      expect(result).toHaveLength(1);
      expect(result[0].roomNumber).toBe('101');
    });

    it('should filter rooms by type', () => {
      const result = filterBySearch(mockRooms, 'suite');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('SUITE_A');
    });

    it('should be case insensitive', () => {
      const result = filterBySearch(mockRooms, 'DOBLE');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DOBLE');
    });

    it('should return empty array when no matches', () => {
      const result = filterBySearch(mockRooms, 'nonexistent');
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty search query', () => {
      const result = filterBySearch(mockRooms, '');
      
      expect(result).toEqual(mockRooms);
    });
  });

  describe('filterByFloor', () => {
    it('should filter rooms by floor number', () => {
      const result = filterByFloor(mockRooms, '1');
      
      expect(result).toHaveLength(2);
      expect(result.every(room => room.floor === 1)).toBe(true);
    });

    it('should filter rooms by different floor', () => {
      const result = filterByFloor(mockRooms, '2');
      
      expect(result).toHaveLength(1);
      expect(result[0].floor).toBe(2);
    });

    it('should return empty array for non-existent floor', () => {
      const result = filterByFloor(mockRooms, '99');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByType', () => {
    it('should filter rooms by type', () => {
      const result = filterByType(mockRooms, 'DOBLE');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DOBLE');
    });

    it('should filter suite rooms', () => {
      const result = filterByType(mockRooms, 'SUITE_A');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('SUITE_A');
    });

    it('should return empty array for non-existent type', () => {
      const result = filterByType(mockRooms, 'SUITE_B');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('applyRoomFilters', () => {
    it('should apply single filter', () => {
      const filters = { searchQuery: '101' };
      const result = applyRoomFilters(mockRooms, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].roomNumber).toBe('101');
    });

    it('should apply multiple filters', () => {
      const filters = { 
        floorFilter: '1',
        typeFilter: 'DOBLE' as RoomType
      };
      const result = applyRoomFilters(mockRooms, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].roomNumber).toBe('102');
      expect(result[0].type).toBe('DOBLE');
      expect(result[0].floor).toBe(1);
    });

    it('should return empty array when filters dont match', () => {
      const filters = { 
        floorFilter: '1',
        typeFilter: 'SUITE_A' as RoomType
      };
      const result = applyRoomFilters(mockRooms, filters);
      
      expect(result).toHaveLength(0);
    });

    it('should return all rooms when no filters applied', () => {
      const filters = {};
      const result = applyRoomFilters(mockRooms, filters);
      
      expect(result).toEqual(mockRooms);
    });

    it('should handle complex filter combinations', () => {
      const filters = { 
        searchQuery: '1',  // Rooms containing '1'
        floorFilter: '1'   // Floor 1
      };
      const result = applyRoomFilters(mockRooms, filters);
      
      expect(result).toHaveLength(2); // 101 and 102
      expect(result.every(room => room.floor === 1)).toBe(true);
      expect(result.every(room => room.roomNumber.includes('1'))).toBe(true);
    });
  });
});
