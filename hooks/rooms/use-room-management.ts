import { useState, useCallback } from 'react';
import { Room } from '@prisma/client';
import { toast } from '@/hooks/use-toast';

interface UseRoomManagementProps {
  onRoomUpdated?: () => void;
}

export function useRoomManagement({ onRoomUpdated }: UseRoomManagementProps = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const deleteRoom = useCallback(async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar la habitación');
      }

      toast({
        title: "Habitación eliminada",
        description: "La habitación ha sido eliminada exitosamente.",
      });

      onRoomUpdated?.();
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la habitación",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onRoomUpdated]);

  const updateRoom = useCallback(async (roomId: string, data: Partial<Room>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la habitación');
      }

      const updatedRoom = await response.json();
      
      toast({
        title: "Habitación actualizada",
        description: "La información de la habitación ha sido actualizada exitosamente.",
      });

      onRoomUpdated?.();
      return updatedRoom;
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la habitación",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onRoomUpdated]);

  return {
    deleteRoom,
    updateRoom,
    isLoading,
  };
}
