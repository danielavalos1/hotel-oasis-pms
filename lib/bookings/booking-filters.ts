import { Booking } from "@prisma/client";

/**
 * Filtra reservas por huésped (búsqueda de texto)
 */
export function filterBookingsByGuest(bookings: Booking[], searchQuery: string): Booking[] {
  if (!searchQuery.trim()) return bookings;

  const query = searchQuery.toLowerCase();
  return bookings.filter(
    (booking) =>
      // Aquí necesitarías incluir los datos del huésped con include en la query
      booking.id.toString().includes(query) ||
      booking.status.toLowerCase().includes(query)
  );
}

/**
 * Filtra reservas por estado
 */
export function filterBookingsByStatus(bookings: Booking[], status: string): Booking[] {
  if (status === "all") return bookings;
  return bookings.filter((booking) => booking.status === status);
}

/**
 * Filtra reservas por rango de fechas
 */
export function filterBookingsByDate(
  bookings: Booking[],
  startDate: Date,
  endDate: Date
): Booking[] {
  return bookings.filter((booking) => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    
    return (
      (checkIn >= startDate && checkIn <= endDate) ||
      (checkOut >= startDate && checkOut <= endDate) ||
      (checkIn <= startDate && checkOut >= endDate)
    );
  });
}

/**
 * Aplica todos los filtros de reservas
 */
export function applyBookingFilters(
  bookings: Booking[],
  filters: {
    searchQuery: string;
    statusFilter: string;
    startDate?: Date;
    endDate?: Date;
  }
): Booking[] {
  let result = bookings;

  if (filters.searchQuery) {
    result = filterBookingsByGuest(result, filters.searchQuery);
  }

  if (filters.statusFilter !== "all") {
    result = filterBookingsByStatus(result, filters.statusFilter);
  }

  if (filters.startDate && filters.endDate) {
    result = filterBookingsByDate(result, filters.startDate, filters.endDate);
  }

  return result;
}
