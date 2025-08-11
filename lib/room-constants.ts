import { RoomStatus, RoomType } from "@prisma/client";

export const ROOM_STATUS_VARIANTS: Record<RoomStatus, string> = {
  LIBRE: "bg-green-100 text-green-800 hover:bg-green-100/80",
  RESERVADA: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
  SUCIA: "bg-orange-900 text-yellow-100 hover:bg-yellow-950/80 border-orange-900",
  BLOQUEADA: "bg-red-100 text-red-800 hover:bg-red-100/80",
  OCUPADA: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  EN_MANTENIMIENTO: "bg-red-600 text-red-50 hover:bg-red-100/80",
  LIMPIEZA: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  LIBRE: "Libre",
  RESERVADA: "Reservada",
  SUCIA: "Sucia",
  BLOQUEADA: "Bloqueada",
  OCUPADA: "Ocupada",
  EN_MANTENIMIENTO: "Mantenimiento",
  LIMPIEZA: "Limpieza",
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SENCILLA: "Sencilla",
  SENCILLA_ESPECIAL: "Sencilla Especial",
  DOBLE: "Doble",
  DOBLE_ESPECIAL: "Doble Especial",
  SUITE_A: "Suite A",
  SUITE_B: "Suite B",
};

export const ROOM_BG_VARIANTS: Record<RoomStatus, string> = {
  LIBRE: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  RESERVADA: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
  SUCIA: "bg-orange-800 dark:bg-yellow-950/20 border-orange-900 dark:border-yellow-800",
  BLOQUEADA: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  OCUPADA: "bg-yellow-200 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  EN_MANTENIMIENTO: "bg-red-500 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  LIMPIEZA: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
};

export const FLOOR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
