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
import { useState, useEffect } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

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

// Status badge variants
const statusVariants = {
  confirmed: "bg-green-100 text-green-800 hover:bg-green-100/80",
  "checked-in": "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  "checked-out": "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100/80",
};

export function BookingsTable({ searchQuery = "", dateRange }: BookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    // Simulated fetch with delay to show loading state
    setIsLoading(true);
    
    // In a real app, this would be an API call with filters
    setTimeout(() => {
      const mockData: Booking[] = Array.from({ length: 30 }, (_, i) => ({
        id: `BK-${2000 + i}`,
        guestName: [
          "Juan Pérez",
          "María González",
          "Carlos Ruiz",
          "Ana Ramírez",
          "Miguel López",
        ][Math.floor(Math.random() * 5)],
        checkIn: new Date(
          2025, 
          3, 
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        checkOut: new Date(
          2025,
          3,
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        roomNumber: `${Math.floor(Math.random() * 5) + 1}0${Math.floor(Math.random() * 9) + 1}`,
        status: [
          "confirmed",
          "checked-in",
          "checked-out",
          "cancelled",
        ][Math.floor(Math.random() * 4)],
        totalAmount: Math.floor(Math.random() * 500) + 100,
      }));
      
      // Apply filters
      let filteredData = mockData;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          (booking) => 
            booking.guestName.toLowerCase().includes(query) ||
            booking.id.toLowerCase().includes(query) ||
            booking.roomNumber.includes(query)
        );
      }
      
      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        filteredData = filteredData.filter((booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          
          if (dateRange.from && dateRange.to) {
            return (
              (checkIn >= dateRange.from && checkIn <= dateRange.to) ||
              (checkOut >= dateRange.from && checkOut <= dateRange.to) ||
              (checkIn <= dateRange.from && checkOut >= dateRange.to)
            );
          }
          
          if (dateRange.from) {
            return checkOut >= dateRange.from;
          }
          
          if (dateRange.to) {
            return checkIn <= dateRange.to;
          }
          
          return true;
        });
      }
      
      // Calculate pagination
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      
      // Get current page data
      const startIndex = (currentPage - 1) * pageSize;
      setBookings(filteredData.slice(startIndex, startIndex + pageSize));
      
      setIsLoading(false);
    }, 800);
  }, [searchQuery, dateRange, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
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
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  if (bookings.length === 0) {
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
          {bookings.map((booking) => (
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
                  {booking.status === "checked-in" ? "Check-in" :
                   booking.status === "checked-out" ? "Check-out" :
                   booking.status === "confirmed" ? "Confirmada" : "Cancelada"}
                </Badge>
              </TableCell>
              <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
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
                      <DropdownMenuItem>
                        Check-in
                      </DropdownMenuItem>
                    )}
                    {booking.status === "checked-in" && (
                      <DropdownMenuItem>
                        Check-out
                      </DropdownMenuItem>
                    )}
                    {(booking.status === "confirmed" || booking.status === "checked-in") && (
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
          Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, ((totalPages - 1) * pageSize) + bookings.length)} de {(totalPages - 1) * pageSize + bookings.length} reservas
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              variant={index + 1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          )).slice(
            Math.max(0, currentPage - 3),
            Math.min(totalPages, currentPage + 2)
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}