import { Booking } from "@prisma/client";

/**
 * Ordena reservas por diferentes criterios
 */
export function sortBookings(
  bookings: Booking[],
  sortBy: "checkIn" | "checkOut" | "created" | "guest" = "checkIn"
): Booking[] {
  return [...bookings].sort((a, b) => {
    switch (sortBy) {
      case "checkIn":
        return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
      case "checkOut":
        return new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime();
      case "created":
        return a.id - b.id; // Asumiendo que el ID es incremental
      default:
        return 0;
    }
  });
}

/**
 * Agrupa reservas por estado
 */
export function groupBookingsByStatus(bookings: Booking[]): Record<string, Booking[]> {
  const grouped: Record<string, Booking[]> = {};

  bookings.forEach((booking) => {
    if (!grouped[booking.status]) {
      grouped[booking.status] = [];
    }
    grouped[booking.status].push(booking);
  });

  return grouped;
}

/**
 * Agrupa reservas por fecha de check-in
 */
export function groupBookingsByDate(bookings: Booking[]): Record<string, Booking[]> {
  const grouped: Record<string, Booking[]> = {};

  bookings.forEach((booking) => {
    const dateKey = new Date(booking.checkInDate).toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(booking);
  });

  return grouped;
}

/**
 * Calcula estadísticas de reservas
 */
export function calculateBookingStats(bookings: Booking[]): {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<string, number>;
  averageStay: number;
  totalRevenue: number;
} {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const stats = {
    total: bookings.length,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byStatus: {} as Record<string, number>,
    averageStay: 0,
    totalRevenue: 0,
  };

  let totalDays = 0;

  bookings.forEach((booking) => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    
    // Contar por período
    if (checkIn.toDateString() === today.toDateString()) {
      stats.today++;
    }
    if (checkIn >= startOfWeek) {
      stats.thisWeek++;
    }
    if (checkIn >= startOfMonth) {
      stats.thisMonth++;
    }

    // Contar por estado
    stats.byStatus[booking.status] = (stats.byStatus[booking.status] || 0) + 1;

    // Calcular estadías y revenue
    const stayDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    totalDays += stayDays;
    stats.totalRevenue += parseFloat(booking.totalPrice.toString());
  });

  stats.averageStay = bookings.length > 0 ? totalDays / bookings.length : 0;

  return stats;
}
