import { useState, useCallback } from "react";
import { Room, RoomStatus } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface UpdateRoomData {
  floor: number;
  status: RoomStatus;
}

interface UseRoomUpdatesResult {
  localRooms: Room[];
  isUpdating: boolean;
  updateRoom: (roomId: number, data: UpdateRoomData) => Promise<void>;
  resetLocalChanges: () => void;
}

/**
 * Hook para manejar actualizaciones locales de habitaciones
 */
export function useRoomUpdates(
  originalRooms: Room[]
): UseRoomUpdatesResult {
  const [localRooms, setLocalRooms] = useState<Room[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateRoom = useCallback(async (roomId: number, data: UpdateRoomData) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al actualizar habitación");
      }

      // Actualizar estado local
      setLocalRooms((prev) => {
        const updated = prev.length > 0 ? [...prev] : [...originalRooms];
        const roomIndex = updated.findIndex((r) => r.id === roomId);
        
        if (roomIndex !== -1) {
          updated[roomIndex] = { ...updated[roomIndex], ...data };
        }
        
        return updated;
      });

      // Buscar el número de habitación para el toast
      const room = originalRooms.find(r => r.id === roomId);
      const roomNumber = room?.roomNumber || roomId;

      toast({
        title: "Habitación actualizada",
        description: `La habitación ${roomNumber} fue actualizada correctamente.`,
        variant: "default",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [originalRooms, toast]);

  const resetLocalChanges = useCallback(() => {
    setLocalRooms([]);
  }, []);

  return {
    localRooms,
    isUpdating,
    updateRoom,
    resetLocalChanges,
  };
}
