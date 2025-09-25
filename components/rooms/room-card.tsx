import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash, Plus, LogIn, LogOut } from "lucide-react";
import { Room, RoomStatus, RoomType } from "@prisma/client";
import { RoomStatusBadge } from "./room-status-badge";
import { RoomAmenities } from "./room-amenities";
import { RoomDoorStatus } from "./room-door-status";
import { EditRoomDialog } from "./edit-room-dialog";
import { BookingEventModal } from "@/components/dashboard/booking-event-modal";
import { NewBookingForm } from "@/app/dashboard/bookings/new-booking-form";
import { 
  ROOM_TYPE_LABELS, 
  ROOM_BG_VARIANTS,
  formatRoomPrice,
  getRoomCapacityText,
  needsLightText
} from "@/lib/rooms";
import { useState } from "react";

const roomTypeLabels: Record<RoomType, string> = ROOM_TYPE_LABELS;
const roomBgVariants: Record<RoomStatus, string> = ROOM_BG_VARIANTS;

interface RoomWithRate extends Room {
  roomRates?: Array<{
    id: number;
    basePrice: any; // Decimal
    totalPrice: any; // Decimal
    isActive: boolean;
    isDefault: boolean;
  }>;
}

interface RoomCardProps {
  room: RoomWithRate;
  rooms: Room[];
  onRoomUpdate: (data: { floor: number; status: RoomStatus }) => void;
}

export function RoomCard({ room, rooms, onRoomUpdate }: RoomCardProps) {
  const isLightText = needsLightText(room);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Obtener el precio de la tarifa activa por defecto
  const defaultRate = room.roomRates?.find(rate => rate.isDefault && rate.isActive);
  const displayPrice = defaultRate ? 
    (typeof defaultRate.totalPrice === 'object' && 'toNumber' in defaultRate.totalPrice 
      ? defaultRate.totalPrice.toNumber() 
      : Number(defaultRate.totalPrice)) 
    : 0;

  // Determinar qué opciones mostrar según el estado de la habitación
  const showCheckIn = room.status === "RESERVADA"; // Solo si tiene reserva
  const showCheckOut = room.status === "OCUPADA"; // Solo si está ocupada
  const showNewBooking = room.status === "LIBRE"; // Solo si está libre

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-all ${
        roomBgVariants[room.status]
      }`}
    >
      <CardHeader className="p-3 pb-2 flex flex-row justify-between items-start">
        <CardTitle
          className={`text-base font-medium ${
            isLightText ? "text-orange-50" : ""
          }`}
        >
          <div className="flex items-center justify-start gap-2">
            {room.roomNumber}
            <RoomDoorStatus
              status={room.status}
              nextStatus={room.status === "OCUPADA" ? "LIBRE" : room.status}
            />
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal
                className={`h-3 w-3 ${
                  isLightText ? "text-orange-50" : ""
                }`}
              />
              <span className="sr-only">Menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <EditRoomDialog room={room} onSave={onRoomUpdate} />

            {showNewBooking && (
              <>
                <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Reserva
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Nueva Reserva - Habitación {room.roomNumber}</DialogTitle>
                    </DialogHeader>
                    <NewBookingForm 
                      preselectedRoom={room}
                      onSuccess={() => setIsNewBookingOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
                <DropdownMenuSeparator />
              </>
            )}

            {showCheckIn && (
              <DropdownMenuItem>
                <BookingEventModal
                  bookingId={1}
                  userId={1}
                  rooms={[room]}
                  eventType="CHECKIN"
                  onEvent={() => {}}
                />
                <LogIn className="mr-2 h-4 w-4" />
                Check-in
              </DropdownMenuItem>
            )}

            {showCheckOut && (
              <DropdownMenuItem>
                <BookingEventModal
                  bookingId={1}
                  userId={1}
                  rooms={[room]}
                  eventType="CHECKOUT"
                  onEvent={() => {}}
                />
                <LogOut className="mr-2 h-4 w-4" />
                Check-out
              </DropdownMenuItem>
            )}

            {(showCheckIn || showCheckOut) && (
              <>
                <DropdownMenuItem>
                  <BookingEventModal
                    bookingId={1}
                    userId={1}
                    rooms={rooms}
                    eventType="OTHER"
                    onEvent={() => {}}
                  />
                  Otro evento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem>Ver reservas</DropdownMenuItem>
            <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex justify-between items-center">
          <RoomStatusBadge status={room.status} />
          <span
            className={`text-xs font-medium ${
              isLightText ? "text-orange-50" : ""
            }`}
          >
            {formatRoomPrice(displayPrice)}
          </span>
        </div>

        <div
          className={`text-xs text-muted-foreground ${
            isLightText ? "text-orange-50" : ""
          }`}
        >
          {roomTypeLabels[room.type] || room.type}
          {" • "}
          {getRoomCapacityText(room.capacity)}
        </div>

        <RoomAmenities amenities={room.amenities} maxVisible={2} />
      </CardContent>
    </Card>
  );
}
