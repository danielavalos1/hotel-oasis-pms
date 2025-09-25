import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash, Edit, Settings, Eye } from "lucide-react";
import { Room, RoomStatus } from "@prisma/client";
import { EditRoomForm } from "./edit-room-form";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

interface RoomActionsProps {
  room: Room;
  rooms: Room[];
  onRoomUpdate: (data: { floor: number; status: RoomStatus }) => void;
  onRoomDeleted?: () => void;
  className?: string;
}

export function RoomActions({ 
  room, 
  rooms, 
  onRoomUpdate, 
  onRoomDeleted,
  className = "" 
}: RoomActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { session } = useAuth();
  
  // Verificar si el usuario es administrador
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
  
  const handleRoomUpdated = () => {
    setIsEditDialogOpen(false);
    // Trigger refetch of rooms data
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleRoomDeleted = () => {
    if (onRoomDeleted) {
      onRoomDeleted();
    } else {
      // Trigger refetch of rooms data
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${className}`}
          >
            <MoreHorizontal
              className={`h-3 w-3 ${
                room.status === "SUCIA" ? "text-orange-50" : ""
              }`}
            />
            <span className="sr-only">Menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>

          <DropdownMenuItem>
            Ver Reservas
          </DropdownMenuItem>

          <DropdownMenuItem>
            Cambiar Estado
          </DropdownMenuItem>

          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Habitación
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración Avanzada
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DeleteRoomDialog room={room} onSuccess={handleRoomDeleted}>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar Habitación
                </DropdownMenuItem>
              </DeleteRoomDialog>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para editar habitación */}
      {isAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Editar Habitación {room.roomNumber}
              </DialogTitle>
            </DialogHeader>
            <EditRoomForm 
              room={room} 
              onSuccess={handleRoomUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
