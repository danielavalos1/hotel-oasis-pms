"use client";

import { useState } from "react";
import useSWR from "swr";
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
import { Room, RoomType, RoomStatus } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomsListProps {
  searchQuery?: string;
  floorFilter?: string;
  typeFilter?: string;
}

// Status badge variants
const statusVariants: Record<RoomStatus, string> = {
  LIBRE: "bg-green-100 text-green-800 hover:bg-green-100/80",
  RESERVADA: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
  SUCIA: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  BLOQUEADA: "bg-red-100 text-red-800 hover:bg-red-100/80",
  OCUPADA: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  EN_MANTENIMIENTO: "bg-orange-100 text-orange-800 hover:bg-orange-100/80",
  LIMPIEZA: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80",
};

// Status labels
const statusLabels: Record<RoomStatus, string> = {
  LIBRE: "Libre",
  RESERVADA: "Reservada",
  SUCIA: "Sucia",
  BLOQUEADA: "Bloqueada",
  OCUPADA: "Ocupada",
  EN_MANTENIMIENTO: "Mantenimiento",
  LIMPIEZA: "Limpieza",
};

// Room type labels
const roomTypeLabels: Record<RoomType, string> = {
  SENCILLA: "Sencilla",
  SENCILLA_ESPECIAL: "Sencilla Especial",
  DOBLE: "Doble",
  DOBLE_ESPECIAL: "Doble Especial",
  SUITE_A: "Suite A",
  SUITE_B: "Suite B",
};

function EditRoomDialog({
  room,
  onSave,
}: {
  room: Room;
  onSave: (data: { floor: number; status: RoomStatus }) => void;
}) {
  const [floor, setFloor] = useState(room.floor);
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floor, status }),
      });
      const result = await res.json();
      if (!res.ok || !result.success)
        throw new Error(result.error || "Error al actualizar");
      onSave({ floor, status });
      setOpen(false);
      toast({
        title: "Habitación actualizada",
        description: `La habitación ${room.roomNumber} fue actualizada correctamente.`,
        variant: "default",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar habitación {room.roomNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Piso</label>
            <Select
              value={String(floor)}
              onValueChange={(v) => setFloor(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
                  <SelectItem key={f} value={String(f)}>
                    {`Piso ${f}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as RoomStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RoomsList({
  searchQuery = "",
  floorFilter = "all",
  typeFilter = "all",
}: RoomsListProps) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const { data, isLoading, error } = useSWR<{
    success: boolean;
    data: Room[];
  }>(`/api/rooms/status?date=${dateStr}`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  const allRooms = data?.data || [];

  // Filtros locales
  let filteredData = allRooms;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredData = filteredData.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        room.amenities.some((amenity) => amenity.toLowerCase().includes(query))
    );
  }
  if (floorFilter !== "all") {
    filteredData = filteredData.filter(
      (room) => String(room.floor) === floorFilter
    );
  }
  if (typeFilter !== "all") {
    filteredData = filteredData.filter((room) => room.type === typeFilter);
  }

  // Paginación
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [localRooms, setLocalRooms] = useState<Room[]>([]);
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const rooms = filteredData.slice(startIndex, startIndex + pageSize);

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
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12" />
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
                  <Skeleton className="h-6 w-32" />
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

  if (error) {
    return <div className="text-red-600 p-4">Error al cargar habitaciones</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          No se encontraron habitaciones
        </p>
        <Button variant="outline">Añadir nueva habitación</Button>
      </div>
    );
  }

  // Usar rooms de SWR, pero si hay cambios locales, usarlos
  const displayRooms = localRooms.length > 0 ? localRooms : rooms;

  let filteredDisplayData = displayRooms;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredDisplayData = filteredDisplayData.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        room.amenities.some((amenity) => amenity.toLowerCase().includes(query))
    );
  }
  if (floorFilter !== "all") {
    filteredDisplayData = filteredDisplayData.filter(
      (room) => String(room.floor) === floorFilter
    );
  }
  if (typeFilter !== "all") {
    filteredDisplayData = filteredDisplayData.filter(
      (room) => room.type === typeFilter
    );
  }

  // Paginación
  /*   const displayTotalPages =
    Math.ceil(filteredDisplayData.length / pageSize) || 1; */
  const displayStartIndex = (currentPage - 1) * pageSize;
  const displayRoomsPaginated = filteredDisplayData.slice(
    displayStartIndex,
    displayStartIndex + pageSize
  );

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
          {displayRoomsPaginated.map((room) => (
            <TableRow key={room.id} className="hover:bg-muted/40">
              <TableCell className="font-medium">{room.roomNumber}</TableCell>
              <TableCell>{room.floor}</TableCell>
              <TableCell>
                {roomTypeLabels[room.type as RoomType] || room.type}
              </TableCell>
              <TableCell>
                {room.capacity} {room.capacity === 1 ? "persona" : "personas"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    statusVariants[room.status as keyof typeof statusVariants]
                  }
                >
                  {statusLabels[room.status] || room.status}
                </Badge>
              </TableCell>
              <TableCell>
                {typeof room.pricePerNight === "object" &&
                "toNumber" in room.pricePerNight
                  ? `$${room.pricePerNight.toNumber().toFixed(2)}`
                  : `$${Number(room.pricePerNight).toFixed(2)}`}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="text-xs"
                    >
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
                <div className="flex gap-1">
                  <EditRoomDialog
                    room={room}
                    onSave={({ floor, status }) => {
                      setLocalRooms((prev) => {
                        const updated =
                          prev.length > 0 ? [...prev] : [...rooms];
                        const idx = updated.findIndex((r) => r.id === room.id);
                        if (idx !== -1) {
                          updated[idx] = { ...updated[idx], floor, status };
                        }
                        return updated;
                      });
                    }}
                  />
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
                      <DropdownMenuItem>Ver reservas</DropdownMenuItem>
                      <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t px-4 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
          {Math.min(
            currentPage * pageSize,
            (totalPages - 1) * pageSize + rooms.length
          )}{" "}
          de {(totalPages - 1) * pageSize + rooms.length} habitaciones
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
