"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Users,
  Home,
  CreditCard,
  Activity,
  LogOut,
  ShoppingBag,
  Building2,
  Globe,
  PenTool as Tool,
  Star,
} from "lucide-react";
import { Overview } from "@/components/dashboard/overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { RoomStatus } from "@/components/dashboard/room-status";
import { BookingsList } from "@/components/dashboard/bookings-list";
import { RoomsList } from "@/components/dashboard/rooms-list";
import { GuestsList } from "@/components/dashboard/guests-list";
import { PaymentsList } from "@/components/dashboard/payments-list";
import { ChannelsList } from "@/components/dashboard/channels-list";
import { RatesList } from "@/components/dashboard/rates-list";
import { InventoryList } from "@/components/dashboard/inventory-list";
import { AmenitiesList } from "@/components/dashboard/amenities-list";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Hotel Oasis PMS</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:bg-primary/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Panel de Control
          </h2>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex h-12 items-center space-x-2 overflow-x-auto bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Amenities
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="flex items-center gap-2"
            >
              <Tool className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guests
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <div className="p-6">
                <BookingsList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <div className="p-6">
                <ChannelsList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card>
              <div className="p-6">
                <RatesList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <div className="p-6">
                <InventoryList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rooms">
            <Card>
              <div className="p-6">
                <RoomsList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="amenities">
            <Card>
              <div className="p-6">
                <AmenitiesList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <div className="p-6">
                <InventoryList showMaintenance={true} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="guests">
            <Card>
              <div className="p-6">
                <GuestsList />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <div className="p-6">
                <PaymentsList />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
