"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { RoomStatus, RoomType, Room } from "@prisma/client";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const statusVariants: Record<RoomStatus, string> = {
  LIBRE: "bg-green-100 text-green-800 hover:bg-green-100/80",
  RESERVADA: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
  SUCIA:
    "bg-orange-900 text-yellow-100 hover:bg-yellow-950/80 border-orange-900",
  BLOQUEADA: "bg-red-100 text-red-800 hover:bg-red-100/80",
  OCUPADA: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  EN_MANTENIMIENTO: "bg-red-600 text-red-50 hover:bg-red-100/80",
  LIMPIEZA: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80",
};
const statusLabels: Record<RoomStatus, string> = {
  LIBRE: "Libre",
  RESERVADA: "Reservada",
  SUCIA: "Sucia",
  BLOQUEADA: "Bloqueada",
  OCUPADA: "Ocupada",
  EN_MANTENIMIENTO: "Mantenimiento",
  LIMPIEZA: "Limpieza",
};
const roomTypeLabels: Record<RoomType, string> = {
  SENCILLA: "Sencilla",
  SENCILLA_ESPECIAL: "Sencilla Especial",
  DOBLE: "Doble",
  DOBLE_ESPECIAL: "Doble Especial",
  SUITE_A: "Suite A",
  SUITE_B: "Suite B",
};

// Room background colors based on status
const roomBgVariants: Record<RoomStatus, string> = {
  LIBRE:
    "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  RESERVADA:
    "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
  SUCIA:
    "bg-orange-800 dark:bg-yellow-950/20 border-orange-900 dark:border-yellow-800",
  BLOQUEADA: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  OCUPADA:
    "bg-yellow-200 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  EN_MANTENIMIENTO:
    "bg-red-500 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  LIMPIEZA:
    "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
};

interface RoomGridProps {
  searchQuery?: string;
  floorFilter?: string;
  typeFilter?: string;
}

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
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </DropdownMenuItem>
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

export function RoomGrid({
  searchQuery = "",
  floorFilter = "all",
  typeFilter = "all",
}: RoomGridProps) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const { data, isLoading, error } = useSWR<{ success: boolean; data: Room[] }>(
    `/api/rooms/status?date=${dateStr}`,
    (url: string) => fetch(url).then((r) => r.json())
  );
  const rooms = data?.data || [];

  // Filtros locales
  //const [open, setOpen] = useState(false);
  const [localRooms, setLocalRooms] = useState<Room[]>([]);
  // Usar rooms de SWR, pero si hay cambios locales, usarlos
  const displayRooms = localRooms.length > 0 ? localRooms : rooms;

  let filteredData = displayRooms;
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

  // Agrupar por piso
  const groupedRooms = filteredData.reduce<Record<string, Room[]>>(
    (acc, room) => {
      const floor = String(room.floor);
      if (!acc[floor]) acc[floor] = [];
      acc[floor].push(room);
      return acc;
    },
    {}
  );
  const sortedFloors = Object.keys(groupedRooms).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

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

  if (error) {
    return <div className="text-red-600 p-4">Error al cargar habitaciones</div>;
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          No se encontraron habitaciones
        </p>
        <Button variant="outline">Añadir nueva habitación</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {sortedFloors.map((floor) => (
        <div key={floor} className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Piso {floor}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groupedRooms[floor].map((room) => (
              <Card
                key={room.id}
                className={`overflow-hidden hover:shadow-md transition-all ${
                  roomBgVariants[room.status]
                }`}
              >
                <CardHeader className="p-3 pb-2 flex flex-row justify-between items-start">
                  <CardTitle
                    className={`text-base font-medium ${
                      room.status === "SUCIA" ? "text-orange-50" : ""
                    }`}
                  >
                    {room.roomNumber}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 "
                      >
                        <MoreHorizontal
                          className={`h-3 w-3 ${
                            room.status === "SUCIA" ? "text-orange-50" : ""
                          }`}
                        />
                        <span className="sr-only">Menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <EditRoomDialog
                        room={room}
                        onSave={({ floor, status }) => {
                          setLocalRooms((prev) => {
                            const updated =
                              prev.length > 0 ? [...prev] : [...rooms];
                            const idx = updated.findIndex(
                              (r) => r.id === room.id
                            );
                            if (idx !== -1) {
                              updated[idx] = { ...updated[idx], floor, status };
                            }
                            return updated;
                          });
                        }}
                      />
                      <DropdownMenuItem>Ver reservas</DropdownMenuItem>
                      <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
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
                      className={statusVariants[room.status]}
                    >
                      {statusLabels[room.status]}
                    </Badge>
                    <span
                      className={`text-xs font-medium ${
                        room.status === "SUCIA" ? "text-orange-50" : ""
                      }`}
                    >
                      {typeof room.pricePerNight === "object" &&
                      "toNumber" in room.pricePerNight
                        ? `$${room.pricePerNight.toNumber().toFixed(2)}`
                        : `$${Number(room.pricePerNight).toFixed(2)}`}
                    </span>
                  </div>

                  <div
                    className={`text-xs text-muted-foreground ${
                      room.status === "SUCIA" ? "text-orange-50" : ""
                    }`}
                  >
                    {roomTypeLabels[room.type] || room.type}
                    {" • "}
                    {room.capacity}{" "}
                    {room.capacity === 1 ? "persona" : "personas"}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {room.amenities.slice(0, 2).map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 2 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
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
