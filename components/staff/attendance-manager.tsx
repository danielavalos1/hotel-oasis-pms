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
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  CalendarIcon,
  CheckSquare,
  Clock,
  ClockIcon,
  Plus,
  Trash2,
  Edit,
  RefreshCcw,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AttendanceStatus } from "@prisma/client";

// Tipos
type Attendance = {
  id: number;
  userId: number;
  checkInTime: string;
  checkOutTime?: string | null;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  user: {
    id: number;
    name: string;
    lastName?: string | null;
    department?: {
      name: string;
    } | null;
  };
};

type Employee = {
  id: number;
  name: string;
  lastName?: string | null;
  department?: {
    id: number;
    name: string;
  } | null;
};

type AttendanceFilter = {
  date: Date;
};

const statusBadges: Record<
  AttendanceStatus,
  { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "success" }
> = {
  PRESENT: { label: "Presente", variant: "success" },
  ABSENT: { label: "Ausente", variant: "destructive" },
  LATE: { label: "Tarde", variant: "secondary" },
  ON_LEAVE: { label: "Permiso", variant: "outline" },
  HALF_DAY: { label: "Medio día", variant: "outline" },
};

export function AttendanceManager() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AttendanceFilter>({ date: new Date() });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(
    null
  );

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [filter]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const dateString = filter.date.toISOString().split("T")[0];
      const response = await fetch(`/api/staff/attendance?date=${dateString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await response.json();
      setAttendance(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar asistencia");
      toast.error("Error al cargar asistencia");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/staff?status=ACTIVE");

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleCreateAttendance = async (formData: FormData) => {
    try {
      const userId = parseInt(formData.get("userId") as string);
      const status = formData.get("status") as AttendanceStatus;
      const checkInTime = formData.get("checkInTime") as string;
      let checkOutTime = formData.get("checkOutTime") as string;
      const notes = formData.get("notes") as string;

      if (!checkInTime) {
        toast.error("La hora de entrada es requerida");
        return;
      }

      // If check-in time is provided but check-out time is empty, set it to null
      if (checkOutTime === "") {
        checkOutTime = null as unknown as string;
      }

      const date = new Date(filter.date);
      date.setHours(0, 0, 0, 0);

      // Format the check-in and check-out times
      const checkInDateTime = new Date(date);
      const [checkInHours, checkInMinutes] = checkInTime.split(":");
      checkInDateTime.setHours(parseInt(checkInHours), parseInt(checkInMinutes), 0, 0);

      let checkOutDateTime = null;
      if (checkOutTime) {
        checkOutDateTime = new Date(date);
        const [checkOutHours, checkOutMinutes] = checkOutTime.split(":");
        checkOutDateTime.setHours(parseInt(checkOutHours), parseInt(checkOutMinutes), 0, 0);
      }

      const attendanceData = {
        userId,
        status,
        checkInTime: checkInDateTime.toISOString(),
        checkOutTime: checkOutDateTime ? checkOutDateTime.toISOString() : null,
        date: date.toISOString(),
        notes: notes || undefined,
      };

      const response = await fetch("/api/staff/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register attendance");
      }

      await fetchAttendance();
      setShowAddModal(false);
      toast.success("Asistencia registrada exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al registrar asistencia");
    }
  };

  const handleUpdateAttendance = async (formData: FormData) => {
    try {
      if (!currentAttendance) return;

      const status = formData.get("status") as AttendanceStatus;
      const checkInTime = formData.get("checkInTime") as string;
      let checkOutTime = formData.get("checkOutTime") as string;
      const notes = formData.get("notes") as string;

      if (!checkInTime) {
        toast.error("La hora de entrada es requerida");
        return;
      }

      // If check-in time is provided but check-out time is empty, set it to null
      if (checkOutTime === "") {
        checkOutTime = null as unknown as string;
      }

      const date = new Date(filter.date);
      date.setHours(0, 0, 0, 0);

      // Format the check-in and check-out times
      const checkInDateTime = new Date(date);
      const [checkInHours, checkInMinutes] = checkInTime.split(":");
      checkInDateTime.setHours(parseInt(checkInHours), parseInt(checkInMinutes), 0, 0);

      let checkOutDateTime = null;
      if (checkOutTime) {
        checkOutDateTime = new Date(date);
        const [checkOutHours, checkOutMinutes] = checkOutTime.split(":");
        checkOutDateTime.setHours(parseInt(checkOutHours), parseInt(checkOutMinutes), 0, 0);
      }

      const attendanceData = {
        status,
        checkInTime: checkInDateTime.toISOString(),
        checkOutTime: checkOutDateTime ? checkOutDateTime.toISOString() : null,
        notes: notes || undefined,
      };

      const response = await fetch(`/api/staff/attendance/${currentAttendance.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update attendance");
      }

      await fetchAttendance();
      setShowEditModal(false);
      setCurrentAttendance(null);
      toast.success("Asistencia actualizada exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar asistencia");
    }
  };

  const handleDeleteAttendance = async (attendanceId: number) => {
    try {
      const response = await fetch(`/api/staff/attendance/${attendanceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete attendance");
      }

      await fetchAttendance();
      toast.success("Asistencia eliminada exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar asistencia");
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return "--:--";
    try {
      return format(new Date(timeString), "HH:mm");
    } catch {
      return "--:--";
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
        <Button onClick={fetchAttendance} className="mt-4" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Intentar nuevamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-start text-left"
              >
                <CalendarIcon className="h-4 w-4" />
                {format(filter.date, "PPP", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filter.date}
                onSelect={(date) => setFilter({ ...filter, date: date || new Date() })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilter({ ...filter, date: new Date() })}
            title="Hoy"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Registrar Asistencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Asistencia</DialogTitle>
              <DialogDescription>
                Registre la asistencia de un empleado para el día {format(filter.date, "PPP", { locale: es })}.
              </DialogDescription>
            </DialogHeader>

            <form action={handleCreateAttendance} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Empleado*</Label>
                <Select name="userId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} {employee.lastName || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado*</Label>
                <Select name="status" defaultValue="PRESENT" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Presente</SelectItem>
                    <SelectItem value="ABSENT">Ausente</SelectItem>
                    <SelectItem value="LATE">Tarde</SelectItem>
                    <SelectItem value="ON_LEAVE">Permiso</SelectItem>
                    <SelectItem value="HALF_DAY">Medio día</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Hora de entrada*</Label>
                  <Input
                    id="checkInTime"
                    name="checkInTime"
                    type="time"
                    defaultValue="09:00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Hora de salida</Label>
                  <Input
                    id="checkOutTime"
                    name="checkOutTime"
                    type="time"
                    defaultValue=""
                    placeholder="Pendiente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Registrar</Button>
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
              <TableHead>Estado</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay registros de asistencia para esta fecha.
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {record.user.name.charAt(0)}
                          {record.user.lastName?.charAt(0) || ""}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {record.user.name} {record.user.lastName || ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.user.department?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadges[record.status].variant as any}>
                      {statusBadges[record.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <ClockIcon className="h-3 w-3 text-muted-foreground" />
                    {formatTime(record.checkInTime)}
                  </TableCell>
                  <TableCell>
                    {record.checkOutTime ? (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        {formatTime(record.checkOutTime)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Pendiente</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.notes || (
                      <span className="text-muted-foreground italic">Sin notas</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentAttendance(record);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
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
                              ¿Está seguro de eliminar este registro?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => handleDeleteAttendance(record.id)}
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

      {/* Edit Attendance Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Asistencia</DialogTitle>
            <DialogDescription>
              Actualice el registro de asistencia para el día{" "}
              {format(filter.date, "PPP", { locale: es })}
            </DialogDescription>
          </DialogHeader>

          {currentAttendance && (
            <form action={handleUpdateAttendance} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employee">Empleado</Label>
                <Input
                  id="edit-employee"
                  value={`${currentAttendance.user.name} ${
                    currentAttendance.user.lastName || ""
                  }`}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado*</Label>
                <Select
                  name="status"
                  defaultValue={currentAttendance.status}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Presente</SelectItem>
                    <SelectItem value="ABSENT">Ausente</SelectItem>
                    <SelectItem value="LATE">Tarde</SelectItem>
                    <SelectItem value="ON_LEAVE">Permiso</SelectItem>
                    <SelectItem value="HALF_DAY">Medio día</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-checkInTime">Hora de entrada*</Label>
                  <Input
                    id="edit-checkInTime"
                    name="checkInTime"
                    type="time"
                    defaultValue={formatTime(currentAttendance.checkInTime)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-checkOutTime">Hora de salida</Label>
                  <Input
                    id="edit-checkOutTime"
                    name="checkOutTime"
                    type="time"
                    defaultValue={
                      currentAttendance.checkOutTime
                        ? formatTime(currentAttendance.checkOutTime)
                        : ""
                    }
                    placeholder="Pendiente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={currentAttendance.notes || ""}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentAttendance(null);
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