// __tests__/mocks/handlers.ts
// Definición de handlers para interceptar requests HTTP

import { http, HttpResponse } from 'msw';
import { Room, RoomStatus, RoomType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock data para tests
export const mockRooms: Room[] = [
  {
    id: 1,
    roomNumber: '101',
    type: 'SENCILLA' as RoomType,
    capacity: 2,
    pricePerNight: new Decimal(1200),
    description: 'Habitación sencilla con vista al jardín',
    amenities: ['wifi', 'tv', 'ac'],
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
    description: 'Habitación doble con balcón',
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
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
    description: 'Suite ejecutiva con sala',
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'jacuzzi'],
    isAvailable: false,
    status: 'EN_MANTENIMIENTO' as RoomStatus,
    floor: 2,
  },
];

// Handlers para interceptar requests
export const handlers = [
  // GET /api/rooms - Obtener todas las habitaciones
  http.get('/api/rooms', () => {
    return HttpResponse.json(mockRooms);
  }),

  // GET /api/rooms/:id - Obtener habitación específica
  http.get('/api/rooms/:id', ({ params }) => {
    const { id } = params;
    const roomId = parseInt(id as string);
    const room = mockRooms.find(r => r.id === roomId);
    
    if (!room) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(room);
  }),

  // PATCH /api/rooms/:id - Actualizar habitación
  http.patch('/api/rooms/:id', async ({ params, request }) => {
    const { id } = params;
    const roomId = parseInt(id as string);
    const updates = await request.json() as Partial<Room>;
    
    const roomIndex = mockRooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Simular actualización
    mockRooms[roomIndex] = {
      ...mockRooms[roomIndex],
      ...updates,
    };
    
    return HttpResponse.json(mockRooms[roomIndex]);
  }),

  // POST /api/rooms - Crear nueva habitación
  http.post('/api/rooms', async ({ request }) => {
    const roomData = await request.json() as Omit<Room, 'id'>;
    
    const newRoom: Room = {
      ...roomData,
      id: Date.now(),
    };
    
    mockRooms.push(newRoom);
    return HttpResponse.json(newRoom, { status: 201 });
  }),

  // DELETE /api/rooms/:id - Eliminar habitación
  http.delete('/api/rooms/:id', ({ params }) => {
    const { id } = params;
    const roomId = parseInt(id as string);
    const roomIndex = mockRooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    mockRooms.splice(roomIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/rooms/stats - Estadísticas de habitaciones
  http.get('/api/rooms/stats', () => {
    const stats = {
      total: mockRooms.length,
      available: mockRooms.filter(r => r.status === 'LIBRE').length,
      occupied: mockRooms.filter(r => r.status === 'OCUPADA').length,
      maintenance: mockRooms.filter(r => r.status === 'EN_MANTENIMIENTO').length,
      occupancyRate: Math.round((mockRooms.filter(r => r.status === 'OCUPADA').length / mockRooms.length) * 100),
    };
    
    return HttpResponse.json(stats);
  }),

  // Handlers para errores simulados
  http.get('/api/rooms/error', () => {
    return new HttpResponse('Internal Server Error', { status: 500 });
  }),

  // Handler para delay simulado (testing de loading states)
  http.get('/api/rooms/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return HttpResponse.json(mockRooms);
  }),
];

// Función helper para resetear datos mock
export function resetMockData() {
  mockRooms.length = 0;
  mockRooms.push(
    {
      id: 1,
      roomNumber: '101',
      type: 'SENCILLA' as RoomType,
      capacity: 2,
      pricePerNight: new Decimal(1200),
      description: 'Habitación sencilla con vista al jardín',
      amenities: ['wifi', 'tv', 'ac'],
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
      description: 'Habitación doble con balcón',
      amenities: ['wifi', 'tv', 'ac', 'minibar'],
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
      description: 'Suite ejecutiva con sala',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'jacuzzi'],
      isAvailable: false,
      status: 'EN_MANTENIMIENTO' as RoomStatus,
      floor: 2,
    }
  );
}
