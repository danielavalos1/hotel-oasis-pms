"use client";

import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

// Types
interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  status: string;
  totalAmount: number;
}

interface BookingsTableProps {
  searchQuery?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

// Status badge variants y traducción
const statusVariants = {
  confirmed: "bg-green-100 text-green-800 hover:bg-green-100/80",
  "checked-in": "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  "checked-out": "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100/80",
};
const statusLabels: Record<string, string> = {
  confirmed: "Confirmada",
  "checked-in": "Check-in",
  "checked-out": "Check-out",
  cancelled: "Cancelada",
};

export function BookingsTable({
  searchQuery = "",
  dateRange,
  statusFilter,
}: BookingsTableProps & { statusFilter?: string }) {
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Construir query params para API
  const params = new URLSearchParams();
  if (dateRange?.from && dateRange?.to) {
    params.set("startDate", dateRange.from.toISOString().split("T")[0]);
    params.set("endDate", dateRange.to.toISOString().split("T")[0]);
  }
  const url = `/api/bookings?${params.toString()}`;
  const { data, error } = useSWR<{ success: boolean; data: Booking[] }>(
    url,
    fetcher
  );
  const isLoading = !data && !error;

  if (isLoading) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Huésped</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Habitación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error || !data?.success) {
    return <div className="p-4 text-red-600">Error loading bookings</div>;
  }
  // Datos reales
  let allBookings = data.data;
  // Filtro de búsqueda
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    allBookings = allBookings.filter(
      (b) =>
        b.guestName.toLowerCase().includes(q) ||
        b.id.toString().toLowerCase().includes(q) ||
        b.roomNumber.toLowerCase().includes(q)
    );
  }
  // Filtro de status
  if (statusFilter && statusFilter !== "all") {
    allBookings = allBookings.filter(
      (b) => b.status === statusFilter
    );
  }
  // Filtros de fecha en caso de solo un extremo
  if ((dateRange?.from && !dateRange.to) || (!dateRange?.from && dateRange?.to)) {
    allBookings = allBookings.filter((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      if (dateRange.from) return checkOut >= dateRange.from;
      if (dateRange.to) return checkIn <= dateRange.to;
      return true;
    });
  }
  // Paginación
  const totalPages = Math.ceil(allBookings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const bookingsPage = allBookings.slice(startIndex, startIndex + pageSize);

  if (bookingsPage.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">No se encontraron reservas</p>
        <Button variant="outline">Crear nueva reserva</Button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Huésped</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Habitación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookingsPage.map((booking) => (
            <TableRow key={booking.id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{booking.id}</TableCell>
              <TableCell>{booking.guestName}</TableCell>
              <TableCell>{formatDate(booking.checkIn)}</TableCell>
              <TableCell>{formatDate(booking.checkOut)}</TableCell>
              <TableCell>{booking.roomNumber}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusVariants[booking.status as keyof typeof statusVariants]}
                >
                  {statusLabels[booking.status] || booking.status}
                </Badge>
              </TableCell>
              <TableCell>${booking.totalAmount}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    {booking.status === "confirmed" && (
                      <DropdownMenuItem>Check-in</DropdownMenuItem>
                    )}
                    {booking.status === "checked-in" && (
                      <DropdownMenuItem>Check-out</DropdownMenuItem>
                    )}
                    {(booking.status === "confirmed" ||
                      booking.status === "checked-in") && (
                      <DropdownMenuItem className="text-red-600">
                        Cancelar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t px-4 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a{" "}
          {Math.min(startIndex + pageSize, allBookings.length)} de{" "}
          {allBookings.length} reservas
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            )
            .map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
