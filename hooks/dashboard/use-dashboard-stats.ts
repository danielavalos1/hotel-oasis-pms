import { useMemo } from "react";
import { useRooms } from "@/hooks/rooms";
import { useBookings } from "@/hooks/bookings";
import { useGuests } from "@/hooks/guests";
import { useStaffStats } from "@/hooks/staff";
import { calculateOccupancyRate, calculateRevenue } from "@/lib/dashboard/dashboard-utils";

interface UseDashboardStatsResult {
  stats: {
    occupancyRate: number;
    availableRooms: number;
    totalRooms: number;
    totalRevenue: number;
    checkInsToday: number;
    checkOutsToday: number;
    totalGuests: number;
    totalStaff: number;
  } | undefined;
  isLoading: boolean;
  error: any;
  refreshAll: () => void;
}

/**
 * Hook para obtener estadísticas combinadas del dashboard
 */
export function useDashboardStats(): UseDashboardStatsResult {
  const { rooms, isLoading: roomsLoading, error: roomsError, mutate: mutateRooms } = useRooms();
  const { bookings, isLoading: bookingsLoading, error: bookingsError, mutate: mutateBookings } = useBookings();
  const { guests, isLoading: guestsLoading, error: guestsError, mutate: mutateGuests } = useGuests();
  const { stats: staffStats, isLoading: staffLoading, error: staffError, mutate: mutateStaff } = useStaffStats();

  const isLoading = roomsLoading || bookingsLoading || guestsLoading || staffLoading;
  const error = roomsError || bookingsError || guestsError || staffError;

  const stats = useMemo(() => {
    if (!rooms || !bookings || !guests || !staffStats) {
      return undefined;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    return {
      occupancyRate: calculateOccupancyRate(rooms, bookings),
      availableRooms: rooms.filter(r => r.status === 'LIBRE').length,
      totalRooms: rooms.length,
      totalRevenue: calculateRevenue(bookings),
      checkInsToday: bookings.filter(b => 
        new Date(b.checkInDate).toISOString().split('T')[0] === todayString
      ).length,
      checkOutsToday: bookings.filter(b => 
        new Date(b.checkOutDate).toISOString().split('T')[0] === todayString
      ).length,
      totalGuests: guests.length,
      totalStaff: staffStats.totalStaff,
    };
  }, [rooms, bookings, guests, staffStats]);

  const refreshAll = () => {
    mutateRooms();
    mutateBookings();
    mutateGuests();
    mutateStaff();
  };

  return {
    stats,
    isLoading,
    error,
    refreshAll,
  };
}
