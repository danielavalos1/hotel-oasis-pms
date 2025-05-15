import { useState, useEffect, useRef } from "react";
import { GuestOption } from "@/components/ui/autocomplete-guest";

export function useGuestSearch() {
  const [selectedGuest, setSelectedGuest] = useState<GuestOption | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GuestOption[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const searchGuests = (query: string) => {
    setSearchInput(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      fetch(`/api/guests?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSearchResults(data.data || []);
          }
        })
        .catch((error) => {
          console.error("Error searching guests:", error);
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);
  };

  const selectGuest = (guest: GuestOption | null) => {
    setSelectedGuest(guest);
    if (guest) {
      setSearchInput(`${guest.firstName} ${guest.lastName}`);
    }
  };

  return {
    selectedGuest,
    searchInput,
    searchResults,
    isSearching,
    searchGuests,
    selectGuest,
    setSearchInput
  };
}