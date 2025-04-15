"use client";

import { useState, useEffect } from "react";
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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Room {
  id: string;
  number: string;
  floor: string;
  type: string;
  capacity: number;
  status: string;
  pricePerNight: number;
  amenities: string[];
}

interface RoomsListProps {
  searchQuery?: string;
  floorFilter?: string;
  typeFilter?: string;
}

// Status badge variants
const statusVariants = {
  available: "bg-green-100 text-green-800 hover:bg-green-100/80",
  occupied: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  "out-of-order": "bg-red-100 text-red-800 hover:bg-red-100/80",
  reserved: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
  cleaning: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80",
};

export function RoomsList({ searchQuery = "", floorFilter = "all", typeFilter = "all" }: RoomsListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Simulando la carga de datos con un delay
    setIsLoading(true);
    
    // En una app real, esto sería una llamada a la API con filtros
    setTimeout(() => {
      const mockData: Room[] = Array.from({ length: 50 }, (_, i) => {
        const floor = Math.floor(Math.random() * 4) + 1;
        const roomNumber = `${floor}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`;
        
        return {
          id: `RM-${1000 + i}`,
          number: roomNumber,
          floor: floor.toString(),
          type: ["standard", "deluxe", "suite", "presidential"][Math.floor(Math.random() * 4)],
          capacity: Math.floor(Math.random() * 4) + 1,
          status: ["available", "occupied", "maintenance", "out-of-order", "reserved", "cleaning"][Math.floor(Math.random() * 6)],
          pricePerNight: Math.floor(Math.random() * 400) + 100,
          amenities: [
            "WiFi",
            "TV",
            "A/C",
            "Minibar",
            "Balcony",
            "Ocean View",
            "Jacuzzi",
            "Kitchen"
          ].slice(0, Math.floor(Math.random() * 6) + 1),
        };
      });
      
      // Aplicar filtros
      let filteredData = mockData;
      
      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          (room) => 
            room.number.toLowerCase().includes(query) ||
            room.type.toLowerCase().includes(query) ||
            room.amenities.some(amenity => amenity.toLowerCase().includes(query))
        );
      }
      
      // Filtro por piso
      if (floorFilter !== "all") {
        filteredData = filteredData.filter(room => room.floor === floorFilter);
      }
      
      // Filtro por tipo
      if (typeFilter !== "all") {
        filteredData = filteredData.filter(room => room.type === typeFilter);
      }
      
      // Calcular paginación
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      
      // Obtener datos de la página actual
      const startIndex = (currentPage - 1) * pageSize;
      setRooms(filteredData.slice(startIndex, startIndex + pageSize));
      
      setIsLoading(false);
    }, 800);
  }, [searchQuery, floorFilter, typeFilter, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Piso</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio/Noche</TableHead>
              <TableHead>Amenidades</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">No se encontraron habitaciones</p>
        <Button variant="outline">Añadir nueva habitación</Button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Piso</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Capacidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Precio/Noche</TableHead>
            <TableHead>Amenidades</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{room.number}</TableCell>
              <TableCell>{room.floor}</TableCell>
              <TableCell>
                {room.type === "standard" && "Estándar"}
                {room.type === "deluxe" && "Deluxe"}
                {room.type === "suite" && "Suite"}
                {room.type === "presidential" && "Presidencial"}
              </TableCell>
              <TableCell>{room.capacity} {room.capacity === 1 ? "persona" : "personas"}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className={statusVariants[room.status as keyof typeof statusVariants]}
                >
                  {room.status === "available" && "Disponible"}
                  {room.status === "occupied" && "Ocupada"}
                  {room.status === "maintenance" && "Mantenimiento"}
                  {room.status === "out-of-order" && "Fuera de servicio"}
                  {room.status === "reserved" && "Reservada"}
                  {room.status === "cleaning" && "Limpieza"}
                </Badge>
              </TableCell>
              <TableCell>${room.pricePerNight.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.amenities.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Ver reservas
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Cambiar estado
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between border-t px-4 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, ((totalPages - 1) * pageSize) + rooms.length)} de {(totalPages - 1) * pageSize + rooms.length} habitaciones
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