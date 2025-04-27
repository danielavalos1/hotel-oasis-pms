"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Overview } from "@/components/dashboard/overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { RoomStatus } from "@/components/dashboard/room-status";
import { BookingCalendar } from "@/components/dashboard/booking-calendar";

export default function Dashboard() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          <Activity className="mr-2 h-4 w-4 text-primary" />
          <span>Última actualización: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        <Card className="col-span-full lg:col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Resumen General</CardTitle>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Estado de Habitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomStatus />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 col-span-full transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle>Booking Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingCalendar />
        </CardContent>
      </Card>

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
