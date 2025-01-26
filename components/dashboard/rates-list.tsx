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
import { Eye, Pencil, Trash2 } from "lucide-react";

const rates = [
  {
    id: 1,
    roomType: "Deluxe Room",
    channel: "Booking.com",
    baseRate: "$200",
    currentRate: "$180",
    startDate: "2024-03-20",
    endDate: "2024-04-20",
    status: "Active",
  },
  {
    id: 2,
    roomType: "Suite",
    channel: "Expedia",
    baseRate: "$350",
    currentRate: "$315",
    startDate: "2024-03-20",
    endDate: "2024-04-20",
    status: "Active",
  },
  {
    id: 3,
    roomType: "Standard Room",
    channel: "Airbnb",
    baseRate: "$150",
    currentRate: "$135",
    startDate: "2024-03-20",
    endDate: "2024-04-20",
    status: "Active",
  },
];

export function RatesList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rate Management</h2>
          <p className="text-muted-foreground">Manage your rates across all channels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Bulk Update</Button>
          <Button>Add Rate Plan</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Average Daily Rate</span>
            <span className="text-2xl font-bold">$210</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">RevPAR</span>
            <span className="text-2xl font-bold">$172</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Active Rate Plans</span>
            <span className="text-2xl font-bold">12</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Channels</span>
            <span className="text-2xl font-bold">4</span>
          </div>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Type</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Base Rate</TableHead>
            <TableHead>Current Rate</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell>{rate.roomType}</TableCell>
              <TableCell>{rate.channel}</TableCell>
              <TableCell>{rate.baseRate}</TableCell>
              <TableCell>{rate.currentRate}</TableCell>
              <TableCell>{rate.startDate}</TableCell>
              <TableCell>{rate.endDate}</TableCell>
              <TableCell>
                <Badge variant="success">{rate.status}</Badge>
              </TableCell>
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