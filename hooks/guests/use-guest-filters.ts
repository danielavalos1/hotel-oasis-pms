import { useMemo } from "react";
import { Guest } from "@prisma/client";
import { filterGuestsBySearch } from "@/lib/guests/guest-utils";

export interface GuestFilters {
  searchQuery: string;
}

interface UseGuestFiltersResult {
  filteredGuests: Guest[];
  filterCount: number;
}

/**
 * Hook para filtrar huéspedes
 */
export function useGuestFilters(
  guests: Guest[],
  filters: GuestFilters
): UseGuestFiltersResult {
  const filteredGuests = useMemo(() => {
    if (!guests) return [];

    let result = guests;

    if (filters.searchQuery) {
      result = filterGuestsBySearch(result, filters.searchQuery);
    }

    return result;
  }, [guests, filters]);

  return {
    filteredGuests,
    filterCount: filteredGuests.length,
  };
}
