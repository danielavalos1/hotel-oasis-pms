import { Guest } from "@prisma/client";

/**
 * Filtra huéspedes por búsqueda de texto
 */
export function filterGuestsBySearch(guests: Guest[], searchQuery: string): Guest[] {
  if (!searchQuery.trim()) return guests;

  const query = searchQuery.toLowerCase();
  return guests.filter(
    (guest) =>
      guest.firstName.toLowerCase().includes(query) ||
      guest.lastName.toLowerCase().includes(query) ||
      guest.email.toLowerCase().includes(query) ||
      guest.phoneNumber.toLowerCase().includes(query)
  );
}

/**
 * Ordena huéspedes por diferentes criterios
 */
export function sortGuests(
  guests: Guest[],
  sortBy: "name" | "email" | "recent" = "name"
): Guest[] {
  return [...guests].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "email":
        return a.email.localeCompare(b.email);
      case "recent":
        return b.id - a.id; // Asumiendo que el ID es incremental
      default:
        return 0;
    }
  });
}

/**
 * Obtiene huéspedes frecuentes (con más de X reservas)
 */
export function getFrequentGuests(guests: Guest[], minBookings: number = 3): Guest[] {
  // Esta función necesitaría incluir los datos de reservas
  // Por ahora devolvemos los primeros como ejemplo
  return guests.slice(0, Math.min(10, guests.length));
}

/**
 * Calcula estadísticas de huéspedes
 */
export function calculateGuestStats(guests: Guest[]): {
  total: number;
  withMultipleBookings: number;
  recentSignups: number;
} {
  return {
    total: guests.length,
    withMultipleBookings: Math.floor(guests.length * 0.3), // Mock calculation
    recentSignups: Math.floor(guests.length * 0.2), // Mock calculation
  };
}

/**
 * Formatea el nombre completo del huésped
 */
export function formatGuestName(guest: Guest): string {
  const parts = [guest.firstName, guest.lastName].filter(Boolean);
  return parts.join(' ').trim();
}

/**
 * Busca huéspedes por texto (alias para filterGuestsBySearch)
 */
export function searchGuests(guests: Guest[], searchQuery: string): Guest[] {
  return filterGuestsBySearch(guests, searchQuery);
}

/**
 * Ordena huéspedes por nombre
 */
export function sortGuestsByName(guests: Guest[], direction: 'asc' | 'desc' = 'asc'): Guest[] {
  return [...guests].sort((a, b) => {
    const nameA = formatGuestName(a).toLowerCase();
    const nameB = formatGuestName(b).toLowerCase();
    
    if (direction === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
}
