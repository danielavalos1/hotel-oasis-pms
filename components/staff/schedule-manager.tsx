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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Pencil, Plus, RefreshCcw, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, set } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Tipos
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: {
    id: number;
    name: string;
  } | null;
};

type Schedule = {
  id: number;
  userId: string;
  user: User;
  date: string;
  startTime: string;
  endTime: string;
  isOff: boolean;
  notes?: string | null;
};

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOff, setIsOff] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchSchedules();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      const data = await response.json();
      setStaff(data);
    } catch (err: any) {
      toast.error("Error al cargar personal: " + (err.message || "Unknown error"));
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/schedules");

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await response.json();
      setSchedules(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar horarios");
      toast.error("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (formData: FormData) => {
    try {
      const userId = formData.get("userId") as string;
      const date = formData.get("date") as string;
      const isOffValue = formData.get("isOff") === "true";
      const startTime = isOffValue ? null : formData.get("startTime") as string;
      const endTime = isOffValue ? null : formData.get("endTime") as string;
      const notes = formData.get("notes") as string;

      if (!userId || !date) {
        toast.error("El empleado y fecha son requeridos");
        return;
      }

      if (!isOffValue && (!startTime || !endTime)) {
        toast.error("Por favor especifique el horario");
        return;
      }

      const scheduleData = {
        userId,
        date,
        isOff: isOffValue,
        startTime: isOffValue ? null : startTime,
        endTime: isOffValue ? null : endTime,
        notes: notes || undefined,
      };

      const response = await fetch("/api/staff/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create schedule");
      }

      await fetchSchedules();
      setShowAddModal(false);
      setIsOff(false);
      toast.success("Horario creado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al crear horario");
    }
  };

  const handleUpdateSchedule = async (formData: FormData) => {
    try {
      if (!currentSchedule) return;

      const isOffValue = formData.get("isOff") === "true";
      const startTime = isOffValue ? null : formData.get("startTime") as string;
      const endTime = isOffValue ? null : formData.get("endTime") as string;
      const notes = formData.get("notes") as string;

      if (!isOffValue && (!startTime || !endTime)) {
        toast.error("Por favor especifique el horario");
        return;
      }

      const scheduleData = {
        isOff: isOffValue,
        startTime: isOffValue ? null : startTime,
        endTime: isOffValue ? null : endTime,
        notes: notes || undefined,
      };

      const response = await fetch(`/api/staff/schedules/${currentSchedule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update schedule");
      }

      await fetchSchedules();
      setShowEditModal(false);
      setCurrentSchedule(null);
      setIsOff(false);
      toast.success("Horario actualizado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar horario");
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/staff/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete schedule");
      }

      await fetchSchedules();
      toast.success("Horario eliminado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar horario");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSchedules} className="mt-4" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Intentar nuevamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Horarios</h2>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Horario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Horario</DialogTitle>
              <DialogDescription>
                Asigne un horario para un empleado del hotel.
              </DialogDescription>
            </DialogHeader>

            <form action={handleCreateSchedule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Empleado*</Label>
                <Select name="userId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.department?.name || "Sin departamento"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha*</Label>
                <input type="hidden" name="date" value={date ? format(date, 'yyyy-MM-dd') : ''} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isOff"
                    id="isOff"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={isOff}
                    onChange={(e) => setIsOff(e.target.checked)}
                    value={isOff ? "true" : "false"}
                  />
                  <Label htmlFor="isOff">Día libre</Label>
                </div>
              </div>

              {!isOff && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Hora de entrada</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        defaultValue="09:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Hora de salida</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        defaultValue="17:00"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Notas adicionales..."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setIsOff(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay horarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {schedule.user.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.user.department?.name || (
                      <span className="text-muted-foreground italic">
                        Sin departamento
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(schedule.date), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {schedule.isOff ? (
                      <Badge variant="secondary">Día libre</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {schedule.notes || (
                      <span className="text-muted-foreground italic">
                        Sin notas
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentSchedule(schedule);
                          setIsOff(schedule.isOff);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Está seguro de eliminar este horario?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Schedule Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
            <DialogDescription>
              Actualice los detalles del horario.
            </DialogDescription>
          </DialogHeader>

          {currentSchedule && (
            <form action={handleUpdateSchedule} className="space-y-4">
              <div className="space-y-2">
                <Label>Empleado</Label>
                <div className="p-2 border rounded-md bg-muted/50">
                  {currentSchedule.user.name}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="p-2 border rounded-md bg-muted/50">
                  {format(parseISO(currentSchedule.date), "PPP", { locale: es })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isOff"
                    id="edit-isOff"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={isOff}
                    onChange={(e) => setIsOff(e.target.checked)}
                    value={isOff ? "true" : "false"}
                  />
                  <Label htmlFor="edit-isOff">Día libre</Label>
                </div>
              </div>

              {!isOff && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-startTime">Hora de entrada</Label>
                      <Input
                        id="edit-startTime"
                        name="startTime"
                        type="time"
                        defaultValue={currentSchedule.startTime || "09:00"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-endTime">Hora de salida</Label>
                      <Input
                        id="edit-endTime"
                        name="endTime"
                        type="time"
                        defaultValue={currentSchedule.endTime || "17:00"}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  placeholder="Notas adicionales..."
                  defaultValue={currentSchedule.notes || ""}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentSchedule(null);
                    setIsOff(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}