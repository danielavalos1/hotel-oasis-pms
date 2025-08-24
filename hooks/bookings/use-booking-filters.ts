import { useMemo } from "react";
import { Booking } from "@prisma/client";
import { filterBookingsByStatus, filterBookingsByDate, filterBookingsByGuest } from "@/lib/bookings/booking-filters";

export interface BookingFilters {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  startDate?: Date;
  endDate?: Date;
}

interface UseBookingFiltersResult {
  filteredBookings: Booking[];
  filterCount: number;
}

/**
 * Hook para filtrar reservas
 */
export function useBookingFilters(
  bookings: Booking[],
  filters: BookingFilters
): UseBookingFiltersResult {
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    let result = bookings;

    // Aplicar filtros en secuencia
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
  }, [bookings, filters]);

  return {
    filteredBookings,
    filterCount: filteredBookings.length,
  };
}
