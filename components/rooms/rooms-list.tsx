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
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { RoomType } from "@prisma/client";

type Room = {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  isAvailable: boolean;
};

type ApiResponse = {
  success: boolean;
  data: Room[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatRoomType = (type: RoomType) => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export function RoomsList() {
  const { data, error, isLoading } = useSWR<ApiResponse>("/api/rooms", fetcher);

  if (error) return <div>Error loading rooms</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rooms</h2>
        <Button>Add Room</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price per Night</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.roomNumber}</TableCell>
              <TableCell>{formatRoomType(room.roomType)}</TableCell>
              <TableCell>${room.pricePerNight}</TableCell>
              <TableCell>
                <Badge variant={room.isAvailable ? "success" : "destructive"}>
                  {room.isAvailable ? "Available" : "Occupied"}
                </Badge>
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
