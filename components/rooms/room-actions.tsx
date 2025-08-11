import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Edit } from "lucide-react";
import { Room, RoomStatus } from "@prisma/client";
import { BookingEventModal } from "@/components/dashboard/booking-event-modal";

interface EditRoomDialogProps {
  room: Room;
  onSave: (data: { floor: number; status: RoomStatus }) => void;
}

// Temporary placeholder for EditRoomDialog - will be replaced with proper import
function EditRoomDialogPlaceholder({ room, onSave }: EditRoomDialogProps) {
  return (
    <DropdownMenuItem>
      <Edit className="mr-2 h-4 w-4" /> Editar
    </DropdownMenuItem>
  );
}

interface RoomActionsProps {
  room: Room;
  rooms: Room[];
  onRoomUpdate: (data: { floor: number; status: RoomStatus }) => void;
  className?: string;
}

export function RoomActions({ 
  room, 
  rooms, 
  onRoomUpdate, 
  className = "" 
}: RoomActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${className}`}
        >
          <MoreHorizontal
            className={`h-3 w-3 ${
              room.status === "SUCIA" ? "text-orange-50" : ""
            }`}
          />
          <span className="sr-only">Menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <EditRoomDialogPlaceholder room={room} onSave={onRoomUpdate} />

        <DropdownMenuItem>
          <BookingEventModal
            bookingId={1} // Mock bookingId - en producción obtenlo de las reservas activas
            userId={1}
            rooms={[room]}
            eventType="CHECKIN"
            onEvent={() => {
              // Refrescar datos tras registrar evento
            }}
          />
        </DropdownMenuItem>

        <DropdownMenuItem>
          <BookingEventModal
            bookingId={1}
            userId={1}
            rooms={[room]}
            eventType="CHECKOUT"
            onEvent={() => {
              // Refrescar datos tras registrar evento
            }}
          />
        </DropdownMenuItem>

        <DropdownMenuItem>
          <BookingEventModal
            bookingId={1}
            userId={1}
            rooms={rooms} // Todas las habitaciones para cambio
            eventType="OTHER"
            onEvent={() => {
              // Refrescar datos tras registrar evento
            }}
          />
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem>Ver reservas</DropdownMenuItem>
        <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          <Trash className="mr-2 h-4 w-4" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
