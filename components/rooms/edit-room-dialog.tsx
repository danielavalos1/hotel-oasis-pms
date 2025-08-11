import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Room, RoomStatus } from "@prisma/client";
import { ROOM_STATUS_LABELS, FLOOR_OPTIONS } from "@/lib/room-constants";

interface EditRoomDialogProps {
  room: Room;
  onSave: (data: { floor: number; status: RoomStatus }) => void;
}

export function EditRoomDialog({ room, onSave }: EditRoomDialogProps) {
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
                {FLOOR_OPTIONS.map((f) => (
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
                {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
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
