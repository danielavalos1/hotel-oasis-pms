import { Room, Booking } from "@prisma/client";

/**
 * Calcula la tasa de ocupación basada en habitaciones y reservas
 */
export function calculateOccupancyRate(rooms: Room[] | number, bookings?: Booking[] | number): number {
  // Handle simple number inputs for testing
  if (typeof rooms === 'number') {
    const totalRooms = rooms;
    const occupiedRooms = typeof bookings === 'number' ? bookings : 0;
    if (totalRooms === 0) return 0;
    return Math.round((occupiedRooms / totalRooms) * 100);
  }

  // Handle Room array inputs
  if (rooms.length === 0) return 0;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Contar habitaciones ocupadas hoy
  const occupiedRooms = (bookings as Booking[]).filter(booking => {
    const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0];
    const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0];
    return checkIn <= todayString && checkOut > todayString;
  }).length;

  return Math.round((occupiedRooms / rooms.length) * 100);
}

/**
 * Calcula el revenue total de las reservas
 */
export function calculateRevenue(bookings: any[]): number {
  return bookings
    .filter(booking => booking.status === 'CONFIRMED')
    .reduce((total, booking) => {
      const price = typeof booking.totalPrice === 'object' && booking.totalPrice.toNumber 
        ? booking.totalPrice.toNumber() 
        : booking.totalPrice;
      return total + price;
    }, 0);
}

/**
 * Calcula revenue de un período específico
 */
export function calculateRevenueForPeriod(
  bookings: Booking[],
  startDate: Date,
  endDate: Date
): number {
  return bookings
    .filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      return checkIn >= startDate && checkIn <= endDate;
    })
    .reduce((total, booking) => {
      return total + parseFloat(booking.totalPrice.toString());
    }, 0);
}

/**
 * Obtiene check-ins de hoy
 */
export function getTodayCheckIns(bookings: Booking[]): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(booking => 
    new Date(booking.checkInDate).toISOString().split('T')[0] === today
  );
}

/**
 * Obtiene check-outs de hoy
 */
export function getTodayCheckOuts(bookings: Booking[]): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(booking => 
    new Date(booking.checkOutDate).toISOString().split('T')[0] === today
  );
}

/**
 * Obtiene habitaciones disponibles por tipo
 */
export function getAvailableRoomsByType(rooms: Room[]): Record<string, number> {
  const available = rooms.filter(room => room.status === 'LIBRE');
  const byType: Record<string, number> = {};

  available.forEach(room => {
    byType[room.type] = (byType[room.type] || 0) + 1;
  });

  return byType;
}

/**
 * Calcula métricas de rendimiento del hotel
 */
export function calculateHotelMetrics(
  rooms: Room[],
  bookings: Booking[]
): {
  occupancyRate: number;
  adr: number; // Average Daily Rate
  revPAR: number; // Revenue Per Available Room
  totalRevenue: number;
  availableRooms: number;
} {
  const occupancyRate = calculateOccupancyRate(rooms, bookings);
  const totalRevenue = calculateRevenue(bookings);
  const availableRooms = rooms.filter(r => r.status === 'LIBRE').length;
  
  const adr = bookings.length > 0 ? totalRevenue / bookings.length : 0;
  const revPAR = rooms.length > 0 ? totalRevenue / rooms.length : 0;

  return {
    occupancyRate,
    adr,
    revPAR,
    totalRevenue,
    availableRooms,
  };
}

/**
 * Formatea cantidades monetarias con formato de moneda
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Obtiene métricas del dashboard principal
 */
export function getDashboardMetrics(
  rooms: any[],
  bookings: any[],
  guests: any[]
): {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalRevenue: number;
  totalGuests: number;
} {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(room => !room.isAvailable).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Calculate revenue from confirmed bookings only
  const totalRevenue = bookings
    .filter(booking => booking.status === 'CONFIRMED')
    .reduce((total, booking) => {
      const price = typeof booking.totalPrice === 'object' && booking.totalPrice.toNumber 
        ? booking.totalPrice.toNumber() 
        : booking.totalPrice;
      return total + price;
    }, 0);
  
  const totalGuests = guests.length;

  return {
    totalRooms,
    occupiedRooms,
    occupancyRate,
    totalRevenue,
    totalGuests,
  };
}
