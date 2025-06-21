"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookingEventType, Room, Booking } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, LogOut, ArrowRightLeft } from "lucide-react";

interface BookingEventModalProps {
  bookingId?: number;
  userId: number;
  rooms: Room[];
  bookings?: Booking[];
  eventType?: BookingEventType; // Pre-seleccionar tipo de evento
  onEvent?: () => void;
}

export function BookingEventModal({
  bookingId,
  userId,
  rooms,
  bookings = [],
  eventType: preSelectedEventType,
  onEvent,
}: BookingEventModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    bookingId ?? null
  );
  const [eventType, setEventType] = useState<BookingEventType | "">(
    preSelectedEventType || ""
  );
  const [notes, setNotes] = useState("");
  const [newRoomId, setNewRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Cambio el open");
    console.log(open);
  }, [open]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBookingId}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, userId, notes, newRoomId }),
      });
      const result = await res.json();
      if (!res.ok || !result.success)
        throw new Error(result.error || "Error al registrar evento");
      toast({
        title: "Evento registrado",
        description: `Evento ${eventType} registrado correctamente.`,
        variant: "default",
      });
      setOpen(false); // Solo cerrar en éxito
      setEventType("");
      setNotes("");
      setNewRoomId(null);
      setSelectedBookingId(null);
      onEvent?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      toast({ title: "Error", description: message, variant: "destructive" });
      // No cerrar el modal en error
    } finally {
      setLoading(false);
    }
  }

  // Función específica para abrir con tipo predefinido
  function openModalWithEventType(type: BookingEventType) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setEventType(type);
      setOpen(true);
    };
  }

  // Función genérica para abrir
  function openModalFromMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  // Mapeo de iconos por tipo de evento
  const eventTypeIcons: Record<BookingEventType, React.JSX.Element> = {
    CHECKIN: <CalendarCheck className="mr-2 h-4 w-4" />,
    CHECKOUT: <LogOut className="mr-2 h-4 w-4" />,
    EXTENSION: <ArrowRightLeft className="mr-2 h-4 w-4" />,
    NO_SHOW: <CalendarCheck className="mr-2 h-4 w-4" />,
    EARLY_CHECKOUT: <LogOut className="mr-2 h-4 w-4" />,
    OTHER: <ArrowRightLeft className="mr-2 h-4 w-4" />,
  };

  // Mapeo de etiquetas en español
  const eventTypeLabels: Record<BookingEventType, string> = {
    CHECKIN: "Check-in",
    CHECKOUT: "Check-out",
    EXTENSION: "Extensión",
    NO_SHOW: "No Show",
    EARLY_CHECKOUT: "Check-out temprano",
    OTHER: "Cambio de habitación",
  };

  return (
    <>
      {preSelectedEventType ? (
        // Botón específico para un tipo de evento
        <div
          className="flex items-center w-full"
          onClick={openModalWithEventType(preSelectedEventType)}
        >
          {eventTypeIcons[preSelectedEventType]}
          {eventTypeLabels[preSelectedEventType]}
        </div>
      ) : (
        // Botón genérico
        <Button variant="outline" onClick={openModalFromMenu}>
          Registrar evento
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {preSelectedEventType
                ? `Registrar ${eventTypeLabels[preSelectedEventType]}`
                : "Registrar evento de reserva"}
            </DialogTitle>
            <DialogDescription>
              Completa la información para registrar el evento seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {bookings.length > 1 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reserva
                </label>
                <Select
                  value={selectedBookingId ? String(selectedBookingId) : ""}
                  onValueChange={(v) => setSelectedBookingId(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona reserva" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {`#${b.id} (${b.status}) - ${b.checkInDate
                          .toString()
                          .slice(0, 10)} a ${b.checkOutDate
                          .toString()
                          .slice(0, 10)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!preSelectedEventType && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de evento
                </label>
                <Select
                  value={eventType}
                  onValueChange={(v) => setEventType(v as BookingEventType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center">
                          {eventTypeIcons[key as BookingEventType]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {eventType === "OTHER" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nueva habitación
                </label>
                <Select
                  value={newRoomId ? String(newRoomId) : ""}
                  onValueChange={(v) => setNewRoomId(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona habitación" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notas</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !eventType || !selectedBookingId}
              >
                {loading ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
