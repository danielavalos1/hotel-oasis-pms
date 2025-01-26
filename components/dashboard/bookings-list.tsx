"use client";

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

const bookings = [
  {
    id: 1,
    guest: "John Smith",
    room: "101",
    checkIn: "2024-03-20",
    checkOut: "2024-03-25",
    status: "Confirmed",
    totalPrice: "$750",
  },
  {
    id: 2,
    guest: "Sarah Johnson",
    room: "205",
    checkIn: "2024-03-21",
    checkOut: "2024-03-23",
    status: "Checked In",
    totalPrice: "$450",
  },
  {
    id: 3,
    guest: "Michael Brown",
    room: "304",
    checkIn: "2024-03-22",
    checkOut: "2024-03-24",
    status: "Pending",
    totalPrice: "$500",
  },
];

export function BookingsList() {
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
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.guest}</TableCell>
              <TableCell>{booking.room}</TableCell>
              <TableCell>{booking.checkIn}</TableCell>
              <TableCell>{booking.checkOut}</TableCell>
              <TableCell>{booking.status}</TableCell>
              <TableCell>{booking.totalPrice}</TableCell>
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