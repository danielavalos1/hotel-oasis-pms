"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomCard } from "@/components/rooms";
import { useRoomGrid, type RoomFilters } from "@/hooks/rooms";

interface RoomGridProps {
  searchQuery?: string;
  floorFilter?: string;
  typeFilter?: string;
}

export function RoomGrid({
  searchQuery = "",
  floorFilter = "all",
  typeFilter = "all",
}: RoomGridProps) {
  // Configurar filtros
  const filters: RoomFilters = {
    searchQuery,
    floorFilter,
    typeFilter,
  };

  // Usar el hook principal que maneja toda la lógica
  const {
    displayRooms,
    groupedRooms,
    sortedFloors,
    isLoading,
    error,
    isUpdating,
    totalRooms,
    filteredCount,
    filterCount,
    updateRoom,
    resetLocalChanges,
    refreshData,
  } = useRoomGrid(filters);

  // Estados de carga
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

  // Estados de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 p-4 mb-4">Error al cargar habitaciones</div>
        <Button variant="outline" onClick={refreshData}>
          Reintentar
        </Button>
      </div>
    );
  }

  // Estado vacío
  if (filteredCount === 0 && filterCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          No se encontraron habitaciones
        </p>
        <Button variant="outline">Añadir nueva habitación</Button>
      </div>
    );
  }

  // Estado de filtros sin resultados
  if (filteredCount === 0 && filterCount > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-2">
          No se encontraron habitaciones que coincidan con los filtros
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Mostrando 0 de {totalRooms} habitaciones
        </p>
        <Button variant="outline" onClick={resetLocalChanges}>
          Limpiar filtros
        </Button>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="p-4 space-y-8">
      {/* Información de estado */}
      {(filterCount > 0 || isUpdating) && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">
            {filterCount > 0 && (
              <span>
                Mostrando {filteredCount} de {totalRooms} habitaciones
                {filterCount > 0 && ` (${filterCount} filtro${filterCount > 1 ? 's' : ''} activo${filterCount > 1 ? 's' : ''})`}
              </span>
            )}
          </div>
          {isUpdating && (
            <div className="text-sm text-blue-600">
              Actualizando...
            </div>
          )}
        </div>
      )}

      {/* Grilla de habitaciones por piso */}
      {sortedFloors.map((floor) => (
        <div key={floor} className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">
            Piso {floor} ({groupedRooms[floor].length} habitación{groupedRooms[floor].length !== 1 ? 'es' : ''})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groupedRooms[floor].map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                rooms={displayRooms}
                onRoomUpdate={(data) => updateRoom(room.id, data)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
