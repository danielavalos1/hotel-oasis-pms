"use client";

import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Booking = {
  id: number;
  guest: {
    firstName: string;
    lastName: string;
  };
  room: {
    roomNumber: string;
  };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
};

type ApiResponse = {
  success: boolean;
  data: Booking[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function BookingsList() {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    "/api/bookings",
    fetcher
  );

  if (error) return <div>Error loading bookings</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bookings</h2>
        <Button>New Booking</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{`${booking.guest.firstName} ${booking.guest.lastName}`}</TableCell>
              <TableCell>{booking.room.roomNumber}</TableCell>
              <TableCell>
                {format(new Date(booking.checkInDate), "yyyy-MM-dd")}
              </TableCell>
              <TableCell>
                {format(new Date(booking.checkOutDate), "yyyy-MM-dd")}
              </TableCell>
              <TableCell>{booking.status}</TableCell>
              <TableCell>${booking.totalPrice}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
