import { Room } from "@prisma/client";

/**
 * Formatea el precio de una habitación
 */
export function formatRoomPrice(price: any): string {
  if (typeof price === "object" && "toNumber" in price) {
    return `$${price.toNumber().toFixed(2)}`;
  }
  return `$${Number(price).toFixed(2)}`;
}

/**
 * Obtiene el texto de capacidad de una habitación
 */
export function getRoomCapacityText(capacity: number): string {
  return `${capacity} ${capacity === 1 ? "persona" : "personas"}`;
}

/**
 * Verifica si una habitación necesita texto claro (para fondos oscuros)
 */
export function needsLightText(room: Room): boolean {
  return room.status === "SUCIA" || room.status === "EN_MANTENIMIENTO";
}

/**
 * Obtiene la fecha actual como string ISO
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Logs de desarrollo (solo en cliente)
 */
export function logRoomData(label: string, data: any): void {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log(`[RoomGrid] ${label}:`, data);
  }
}
