import { useMemo } from "react";
import { useBookings } from "./use-bookings";
import { useBookingFilters, BookingFilters } from "./use-booking-filters";
import { sortBookings, groupBookingsByStatus, calculateBookingStats } from "@/lib/bookings/booking-utils";

interface UseBookingManagementResult {
  // Datos principales
  bookings: any[] | undefined;
  
  // Datos procesados
  filteredBookings: any[];
  groupedBookings: Record<string, any[]>;
  sortedBookings: any[];
  stats: any;
  
  // Estados
  isLoading: boolean;
  error: any;
  
  // Métricas
  totalBookings: number;
  filteredCount: number;
  
  // Acciones
  refreshData: () => void;
}

/**
 * Hook principal para gestión de reservas
 * Combina todos los hooks específicos y proporciona una API unificada
 */
export function useBookingManagement(
  filters: BookingFilters,
  sortBy: "checkIn" | "checkOut" | "created" | "guest" = "checkIn"
): UseBookingManagementResult {
  // Obtener datos de la API
  const { bookings, isLoading, error, mutate } = useBookings();
  
  // Aplicar filtros
  const { filteredBookings, filterCount } = useBookingFilters(bookings || [], filters);
  
  // Procesar datos
  const processedData = useMemo(() => {
    if (!filteredBookings) {
      return {
        groupedBookings: {},
        sortedBookings: [],
        stats: {},
      };
    }

    const sorted = sortBookings(filteredBookings, sortBy);
    const grouped = groupBookingsByStatus(filteredBookings);
    const stats = calculateBookingStats(filteredBookings);

    return {
      groupedBookings: grouped,
      sortedBookings: sorted,
      stats,
    };
  }, [filteredBookings, sortBy]);
  
  return {
    // Datos principales
    bookings,
    
    // Datos procesados
    filteredBookings,
    groupedBookings: processedData.groupedBookings,
    sortedBookings: processedData.sortedBookings,
    stats: processedData.stats,
    
    // Estados
    isLoading,
    error,
    
    // Métricas
    totalBookings: bookings?.length || 0,
    filteredCount: filterCount,
    
    // Acciones
    refreshData: mutate,
  };
}
