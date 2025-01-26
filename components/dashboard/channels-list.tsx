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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Globe } from "lucide-react";

const channels = [
  {
    id: 1,
    name: "Booking.com",
    status: "Active",
    lastSync: "2024-03-20 10:30",
    bookings: 125,
    revenue: "$45,750",
  },
  {
    id: 2,
    name: "Expedia",
    status: "Active",
    lastSync: "2024-03-20 10:25",
    bookings: 98,
    revenue: "$32,450",
  },
  {
    id: 3,
    name: "Airbnb",
    status: "Active",
    lastSync: "2024-03-20 10:15",
    bookings: 75,
    revenue: "$28,900",
  },
  {
    id: 4,
    name: "Direct Booking",
    status: "Active",
    lastSync: "2024-03-20 10:00",
    bookings: 45,
    revenue: "$15,800",
  },
];

export function ChannelsList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Channel Manager</h2>
          <p className="text-muted-foreground">Manage your distribution channels and rates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Sync All</Button>
          <Button>Add Channel</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Total Channels</span>
            <span className="text-2xl font-bold">4</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Active Channels</span>
            <span className="text-2xl font-bold">4</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Total Bookings</span>
            <span className="text-2xl font-bold">343</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="text-2xl font-bold">$122,900</span>
          </div>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sync</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel) => (
            <TableRow key={channel.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {channel.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="success">{channel.status}</Badge>
              </TableCell>
              <TableCell>{channel.lastSync}</TableCell>
              <TableCell>{channel.bookings}</TableCell>
              <TableCell>{channel.revenue}</TableCell>
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