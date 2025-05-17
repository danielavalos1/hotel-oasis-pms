"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Booking, Guest, BookingRoom, Room } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define BookingWithRelations if not exported from Prisma
export type BookingWithRelations = Booking & {
  guest: Guest;
  bookingRooms: (BookingRoom & { room: Room })[];
};

const statusOptions = [
  { value: "confirmed", label: "Confirmada" },
  { value: "checked-in", label: "Check-in" },
  { value: "checked-out", label: "Check-out" },
  { value: "cancelled", label: "Cancelada" },
];

// Tipos locales para pagos y modificaciones
interface Payment {
  id: number;
  paymentMethod: string;
  paymentDate: string | Date;
  amount: unknown;
}
interface Modification {
  id: number;
  modificationDate: string | Date;
  modificationDetails: string;
}

export function BookingDetail({ booking }: { booking: BookingWithRelations }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(booking.status);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Safe fallback for notes property
  const initialNotes = (booking as Record<string, unknown>).notes;
  const [notes, setNotes] = useState(
    typeof initialNotes === "string" ? initialNotes : ""
  );

  // Fallback seguro para createdAt
  const createdAt =
    "createdAt" in booking && booking.createdAt
      ? typeof booking.createdAt === "string"
        ? booking.createdAt
        : booking.createdAt instanceof Date
        ? booking.createdAt.toISOString()
        : booking.checkInDate
      : booking.checkInDate;
  // Fallback seguro para payments y modifications
  const payments: Payment[] = Array.isArray(
    (booking as Record<string, unknown>).payments
  )
    ? ((booking as Record<string, unknown>).payments as Payment[])
    : [];
  const modifications: Modification[] = Array.isArray(
    (booking as Record<string, unknown>).modifications
  )
    ? ((booking as Record<string, unknown>).modifications as Modification[])
    : [];

  const handleStatusChange = async (newStatus: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      setStatus(newStatus);
      toast({
        title: "Estado actualizado",
        description: `Nuevo estado: ${
          statusOptions.find((s) => s.value === newStatus)?.label || newStatus
        }`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la nota");
      toast({ title: "Notas guardadas" });
      setEditMode(false);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              Reserva #{booking.id}
            </CardTitle>
            <div className="text-muted-foreground text-sm mt-1">
              Creada el{" "}
              {formatDate(
                typeof createdAt === "string"
                  ? createdAt
                  : createdAt.toISOString()
              )}
            </div>
          </div>
          <Badge className="text-base px-4 py-1">
            {statusOptions.find((s) => s.value === status)?.label || status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-semibold text-lg mb-1">
                Datos del huésped
              </div>
              <div>
                <span className="font-medium">Nombre:</span>{" "}
                {booking.guest.firstName} {booking.guest.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                {booking.guest.email}
              </div>
              <div>
                <span className="font-medium">Teléfono:</span>{" "}
                {booking.guest.phoneNumber}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-lg mb-1">Fechas y estado</div>
              <div>
                <span className="font-medium">Check-in:</span>{" "}
                {formatDate(
                  typeof booking.checkInDate === "string"
                    ? booking.checkInDate
                    : booking.checkInDate.toISOString()
                )}
              </div>
              <div>
                <span className="font-medium">Check-out:</span>{" "}
                {formatDate(
                  typeof booking.checkOutDate === "string"
                    ? booking.checkOutDate
                    : booking.checkOutDate.toISOString()
                )}
              </div>
              <div>
                <span className="font-medium">Estado:</span>{" "}
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue>
                      {statusOptions.find((s) => s.value === status)?.label ||
                        status}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="font-medium">Huéspedes:</span>{" "}
                {booking.numberOfGuests}
              </div>
            </div>
          </div>

          <div className="font-semibold text-lg mt-4 mb-2">
            Habitaciones reservadas
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Precio x noche</TableHead>
                <TableHead>Precio reservado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {booking.bookingRooms.map((br) => (
                <TableRow key={br.id}>
                  <TableCell>{br.room.roomNumber}</TableCell>
                  <TableCell>{br.room.type}</TableCell>
                  <TableCell>{br.room.capacity}</TableCell>
                  <TableCell>
                    $
                    {typeof br.room.pricePerNight === "object" &&
                    "toNumber" in br.room.pricePerNight
                      ? br.room.pricePerNight.toNumber().toFixed(2)
                      : Number(br.room.pricePerNight).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    $
                    {typeof br.priceAtTime === "object" &&
                    "toNumber" in br.priceAtTime
                      ? br.priceAtTime.toNumber().toFixed(2)
                      : Number(br.priceAtTime).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="font-semibold text-lg mt-6 mb-2">Notas</div>
          {editMode ? (
            <div className="flex gap-2">
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button onClick={handleSaveNotes} disabled={isSaving}>
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <span>
                {notes || (
                  <span className="text-muted-foreground">Sin notas</span>
                )}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMode(true)}
              >
                Editar
              </Button>
            </div>
          )}

          {payments.length > 0 && (
            <div className="mt-6">
              <div className="font-semibold text-lg mb-2">Pagos</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        Sin pagos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.paymentMethod}</TableCell>
                        <TableCell>
                          {formatDate(
                            typeof p.paymentDate === "string"
                              ? p.paymentDate
                              : p.paymentDate.toISOString()
                          )}
                        </TableCell>
                        <TableCell>
                          $
                          {typeof p.amount === "object" &&
                          "toNumber" in p.amount
                            ? p.amount.toNumber().toFixed(2)
                            : Number(p.amount ?? 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {modifications.length > 0 && (
            <div className="mt-6">
              <div className="font-semibold text-lg mb-2">Modificaciones</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modifications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        Sin modificaciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    modifications.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          {formatDate(
                            typeof m.modificationDate === "string"
                              ? m.modificationDate
                              : m.modificationDate.toISOString()
                          )}
                        </TableCell>
                        <TableCell>{m.modificationDetails}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <span className="font-bold text-2xl">
              Total: $
              {typeof booking.totalPrice === "object" &&
              "toNumber" in booking.totalPrice
                ? booking.totalPrice.toNumber().toFixed(2)
                : Number(booking.totalPrice).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
