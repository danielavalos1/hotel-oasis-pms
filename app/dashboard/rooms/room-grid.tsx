"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MoreHorizontal, Trash, User } from "lucide-react";
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
  currentGuest?: string;
}

interface RoomGridProps {
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

// Room background colors based on status
const roomBgVariants: Record<string, string> = {
  available: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  occupied: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  maintenance: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  "out-of-order": "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  reserved: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
  cleaning: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
};

export function RoomGrid({ searchQuery = "", floorFilter = "all", typeFilter = "all" }: RoomGridProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedRooms, setGroupedRooms] = useState<Record<string, Room[]>>({});
  
  useEffect(() => {
    // Simulando la carga de datos con un delay
    setIsLoading(true);
    
    // En una app real, esto sería una llamada a la API con filtros
    setTimeout(() => {
      const mockData: Room[] = Array.from({ length: 50 }, (_, i) => {
        const floor = Math.floor(Math.random() * 4) + 1;
        const roomNumber = `${floor}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`;
        const status = ["available", "occupied", "maintenance", "out-of-order", "reserved", "cleaning"][Math.floor(Math.random() * 6)];
        
        return {
          id: `RM-${1000 + i}`,
          number: roomNumber,
          floor: floor.toString(),
          type: ["standard", "deluxe", "suite", "presidential"][Math.floor(Math.random() * 4)],
          capacity: Math.floor(Math.random() * 4) + 1,
          status,
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
          // Agregar un huésped actual solo para habitaciones ocupadas
          currentGuest: status === "occupied" ? 
            ["Juan Pérez", "María González", "Carlos Ruiz", "Ana Ramírez", "Miguel López"][Math.floor(Math.random() * 5)] : 
            undefined
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
      
      // Ordenar por número de habitación
      filteredData.sort((a, b) => a.number.localeCompare(b.number));
      
      // Agrupar por piso
      const grouped = filteredData.reduce<Record<string, Room[]>>((acc, room) => {
        if (!acc[room.floor]) {
          acc[room.floor] = [];
        }
        acc[room.floor].push(room);
        return acc;
      }, {});
      
      setGroupedRooms(grouped);
      setRooms(filteredData);
      setIsLoading(false);
    }, 800);
  }, [searchQuery, floorFilter, typeFilter]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="border rounded-md p-3 h-36">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
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

  // Ordenar pisos numéricamente
  const sortedFloors = Object.keys(groupedRooms).sort((a, b) => parseInt(a) - parseInt(b));
  
  return (
    <div className="p-4 space-y-8">
      {sortedFloors.map((floor) => (
        <div key={floor} className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Piso {floor}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groupedRooms[floor].map((room) => (
              <Card 
                key={room.id} 
                className={`overflow-hidden hover:shadow-md transition-all ${roomBgVariants[room.status]}`}
              >
                <CardHeader className="p-3 pb-2 flex flex-row justify-between items-start">
                  <CardTitle className="text-base font-medium">
                    {room.number}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                        <span className="sr-only">Menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
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
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="flex justify-between items-center">
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
                    <span className="text-xs font-medium">${room.pricePerNight}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {room.type === "standard" && "Estándar"}
                    {room.type === "deluxe" && "Deluxe"}
                    {room.type === "suite" && "Suite"}
                    {room.type === "presidential" && "Presidencial"}
                    {" • "}
                    {room.capacity} {room.capacity === 1 ? "persona" : "personas"}
                  </div>
                  
                  {room.currentGuest && (
                    <div className="flex items-center text-xs gap-1 pt-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{room.currentGuest}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 pt-1">
                    {room.amenities.slice(0, 2).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-[10px] px-1 py-0">
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 2 && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        +{room.amenities.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}