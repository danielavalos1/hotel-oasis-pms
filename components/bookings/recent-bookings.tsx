"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSWR from "swr";

type BookingRecent = {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  status: string;
  totalAmount: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RecentBookings() {
  const { data, isLoading, error } = useSWR<{ success: boolean; data: BookingRecent[] }>(
    "/api/bookings",
    fetcher
  );
  const bookings = data?.data?.slice(0, 5) || [];

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Reservas recientes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Huésped</TableHead>
            <TableHead>Habitación</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6}>Cargando...</TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6}>Error al cargar</TableCell>
            </TableRow>
          ) : bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>Sin reservas recientes</TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.guestName}</TableCell>
                <TableCell>{booking.roomNumber}</TableCell>
                <TableCell>{booking.checkIn}</TableCell>
                <TableCell>{booking.checkOut}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell className="text-right">
                  ${booking.totalAmount}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}