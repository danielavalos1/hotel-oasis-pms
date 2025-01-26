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
import { Eye, Pencil, Trash2, PenTool as Tool } from "lucide-react";

const inventory = [
  {
    id: 1,
    roomNumber: "101",
    type: "Deluxe Room",
    maintenanceStatus: "Good",
    lastMaintenance: "2024-03-15",
    nextMaintenance: "2024-04-15",
    notes: "Regular cleaning completed",
  },
  {
    id: 2,
    roomNumber: "102",
    type: "Suite",
    maintenanceStatus: "Needs Attention",
    lastMaintenance: "2024-03-10",
    nextMaintenance: "2024-04-10",
    notes: "AC needs service",
  },
  {
    id: 3,
    roomNumber: "201",
    type: "Standard Room",
    maintenanceStatus: "Under Maintenance",
    lastMaintenance: "2024-03-18",
    nextMaintenance: "2024-04-18",
    notes: "Bathroom renovation",
  },
];

interface InventoryListProps {
  showMaintenance?: boolean;
}

export function InventoryList({ showMaintenance = false }: InventoryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {showMaintenance ? "Maintenance Management" : "Inventory Management"}
          </h2>
          <p className="text-muted-foreground">
            {showMaintenance
              ? "Track and manage room maintenance"
              : "Manage your room inventory and maintenance status"}
          </p>
        </div>
        <div className="flex gap-2">
          {showMaintenance ? (
            <Button>Schedule Maintenance</Button>
          ) : (
            <Button>Update Inventory</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Total Rooms</span>
            <span className="text-2xl font-bold">50</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Available</span>
            <span className="text-2xl font-bold">42</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Under Maintenance</span>
            <span className="text-2xl font-bold">5</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-muted-foreground">Needs Attention</span>
            <span className="text-2xl font-bold">3</span>
          </div>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Maintenance Status</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.roomNumber}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.maintenanceStatus === "Good"
                      ? "success"
                      : item.maintenanceStatus === "Needs Attention"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {item.maintenanceStatus}
                </Badge>
              </TableCell>
              <TableCell>{item.lastMaintenance}</TableCell>
              <TableCell>{item.nextMaintenance}</TableCell>
              <TableCell>{item.notes}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Tool className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
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