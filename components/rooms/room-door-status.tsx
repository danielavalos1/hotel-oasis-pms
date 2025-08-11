import { DoorOpen, DoorClosed, Lock } from "lucide-react";
import { RoomStatus } from "@prisma/client";

interface RoomDoorStatusProps {
  status: RoomStatus;
  nextStatus?: RoomStatus | null;
  className?: string;
}

export function RoomDoorStatus({ 
  status, 
  nextStatus, 
  className = "" 
}: RoomDoorStatusProps) {
  // Si la habitación está en mantenimiento, bloqueada o limpieza, mostrar puerta cerrada con candado
  if (["EN_MANTENIMIENTO", "BLOQUEADA", "LIMPIEZA"].includes(status)) {
    return (
      <span className={`flex items-center gap-1 text-red-700 ${className}`}>
        <DoorClosed className="w-5 h-5" />
        <Lock className="w-4 h-4 -ml-2" />
      </span>
    );
  }

  // Lógica de transición de estados
  if (status === "OCUPADA" && nextStatus === "LIBRE") {
    return (
      <span className={`flex items-center gap-1 text-orange-700 ${className}`}>
        <DoorClosed className="w-5 h-5" />
        <span className="mx-1">→</span>
        <DoorOpen className="w-5 h-5" />
      </span>
    );
  }

  if (status === "RESERVADA" && nextStatus === "OCUPADA") {
    return (
      <span className={`flex items-center gap-1 text-purple-700 ${className}`}>
        <DoorOpen className="w-5 h-5" />
        <span className="mx-1">→</span>
        <DoorClosed className="w-5 h-5" />
      </span>
    );
  }

  if (status === "OCUPADA" && nextStatus === "OCUPADA") {
    return (
      <span className={`flex items-center gap-1 text-blue-700 ${className}`}>
        <DoorClosed className="w-5 h-5" />
        <span className="mx-1">→</span>
        <DoorClosed className="w-5 h-5" />
      </span>
    );
  }

  if (status === "LIBRE" && nextStatus === "LIBRE") {
    return (
      <span className={`flex items-center gap-1 text-green-700 ${className}`}>
        <DoorOpen className="w-5 h-5" />
        <span className="mx-1">→</span>
        <DoorOpen className="w-5 h-5" />
      </span>
    );
  }

  // Default: solo mostrar el estado actual
  return status === "OCUPADA" ? (
    <DoorClosed className={`w-5 h-5 text-blue-700 ${className}`} />
  ) : (
    <DoorOpen className={`w-5 h-5 text-green-700 ${className}`} />
  );
}
