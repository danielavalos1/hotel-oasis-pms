// Interfaces para el formulario de reservas
export interface BookingFormValues {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: string;
  children: string;
  rooms: { roomType: string; roomId: string }[];
  notes: string;
}

export interface RoomOption {
  id: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  basePrice?: number; // Precio base de la tarifa activa
  totalPrice?: number; // Precio total con impuestos de la tarifa activa
  // Mantener pricePerNight para compatibilidad temporal
  pricePerNight: number; // Será igual a totalPrice o basePrice
}

export interface FormattedBookingPayload {
  rooms: {
    roomId: number;
    priceAtTime: number;
  }[];
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  numberOfGuests: number;
  guest: {
    id: number;
  } | {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export const roomTypeLabels: Record<string, string> = {
  SENCILLA: "Sencilla",
  SENCILLA_ESPECIAL: "Sencilla Especial",
  DOBLE: "Doble",
  DOBLE_ESPECIAL: "Doble Especial",
  SUITE_A: "Suite A",
  SUITE_B: "Suite B",
};