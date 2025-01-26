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

const amenities = [
  {
    id: 1,
    name: "Wi-Fi",
    description: "High-speed internet access",
    isAvailable: true,
    lastUpdated: "2024-03-20",
  },
  {
    id: 2,
    name: "Swimming Pool",
    description: "Outdoor pool with heating",
    isAvailable: true,
    lastUpdated: "2024-03-20",
  },
  {
    id: 3,
    name: "Gym",
    description: "24/7 fitness center",
    isAvailable: true,
    lastUpdated: "2024-03-20",
  },
  {
    id: 4,
    name: "Spa",
    description: "Full-service spa and wellness center",
    isAvailable: false,
    lastUpdated: "2024-03-20",
  },
];

export function AmenitiesList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Amenities Management</h2>
          <p className="text-muted-foreground">Manage your property amenities</p>
        </div>
        <Button>Add Amenity</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Total Amenities</span>
            <span className="text-2xl font-bold">12</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Available</span>
            <span className="text-2xl font-bold">10</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Under Maintenance</span>
            <span className="text-2xl font-bold">2</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Utilization Rate</span>
            <span className="text-2xl font-bold">83%</span>
          </div>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {amenities.map((amenity) => (
            <TableRow key={amenity.id}>
              <TableCell className="font-medium">{amenity.name}</TableCell>
              <TableCell>{amenity.description}</TableCell>
              <TableCell>
                <Badge variant={amenity.isAvailable ? "success" : "destructive"}>
                  {amenity.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </TableCell>
              <TableCell>{amenity.lastUpdated}</TableCell>
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