"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { RoomStatus } from "@/components/dashboard/room-status";

export default function DashboardOverviewPage() {
  return (
    <div className="container py-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ADR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$214</div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              RevPAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$175</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Resumen General</CardTitle>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>

        <Card className="col-span-3 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Estado de Habitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomStatus />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle>Reservas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentBookings />
        </CardContent>
      </Card>
    </div>
  );
}