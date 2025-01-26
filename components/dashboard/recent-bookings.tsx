"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const recentBookings = [
  {
    id: 1,
    guest: "John Smith",
    room: "101",
    checkIn: "2024-03-20",
    checkOut: "2024-03-25",
    status: "Confirmed",
    amount: "$750",
  },
  {
    id: 2,
    guest: "Sarah Johnson",
    room: "205",
    checkIn: "2024-03-21",
    checkOut: "2024-03-23",
    status: "Checked In",
    amount: "$450",
  },
  {
    id: 3,
    guest: "Michael Brown",
    room: "304",
    checkIn: "2024-03-22",
    checkOut: "2024-03-24",
    status: "Pending",
    amount: "$500",
  },
];

export function RecentBookings() {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Recent Bookings</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.guest}</TableCell>
              <TableCell>{booking.room}</TableCell>
              <TableCell>{booking.checkIn}</TableCell>
              <TableCell>{booking.checkOut}</TableCell>
              <TableCell>{booking.status}</TableCell>
              <TableCell className="text-right">{booking.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}