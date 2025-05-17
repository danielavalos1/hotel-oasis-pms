"use client";

import { useState } from "react";
import { BookingsTable } from "@/app/dashboard/bookings/bookings-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Plus, Search } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewBookingForm } from "./new-booking-form";

export default function BookingsPage() {
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  return (
    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Reservas</h2>
        <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nueva Reserva</DialogTitle>
            </DialogHeader>
            <NewBookingForm onSuccess={() => setIsNewBookingOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 w-full">
        <div className="relative flex-1 min-w-0 max-w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, email, o número de reserva..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto overflow-x-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal w-full sm:w-auto",
                  dateRange.from && "text-primary"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {dateRange.from.toLocaleDateString()} -{" "}
                      {dateRange.to.toLocaleDateString()}
                    </>
                  ) : (
                    dateRange.from.toLocaleDateString()
                  )
                ) : (
                  "Filtrar por fecha"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangePicker
                initialDateFrom={dateRange.from}
                initialDateTo={dateRange.to}
                onUpdate={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
              />
            </PopoverContent>
          </Popover>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] min-w-[120px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="checked-in">Check-in</SelectItem>
              <SelectItem value="checked-out">Check-out</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" className="shrink-0">
            Limpiar filtros
          </Button>
        </div>
      </div>

      <Card className="transition-all hover:shadow-md overflow-x-auto">
        <CardHeader className="px-4 sm:px-6 py-4">
          <CardTitle className="text-lg">Lista de Reservas</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <BookingsTable
            searchQuery={searchQuery}
            dateRange={dateRange}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
