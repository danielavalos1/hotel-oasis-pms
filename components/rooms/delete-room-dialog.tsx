"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Room } from "@prisma/client";

interface DeleteRoomDialogProps {
  room: Room;
  onSuccess: () => void;
  children?: React.ReactNode;
}

export function DeleteRoomDialog({ room, onSuccess, children }: DeleteRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al eliminar la habitación");
      }

      toast.success("Habitación eliminada exitosamente");
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar la habitación");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {children ? (
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      )}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta acción eliminará permanentemente la habitación{" "}
                <strong>{room.roomNumber}</strong> del sistema.
              </p>
              <p className="text-sm text-muted-foreground">
                Solo se pueden eliminar habitaciones que no tengan reservas activas o futuras.
              </p>
              <div className="bg-muted p-3 rounded-md mt-3">
                <p className="text-sm font-medium">Detalles de la habitación:</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Número: {room.roomNumber}</li>
                  <li>• Tipo: {room.type}</li>
                  <li>• Piso: {room.floor}</li>
                  <li>• Capacidad: {room.capacity} personas</li>
                  <li>• Precio: ${Number(room.pricePerNight)} MXN/noche</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Eliminar Habitación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
