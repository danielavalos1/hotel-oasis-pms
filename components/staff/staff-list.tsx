"use client";

import { useState } from "react";
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit,
  FileText,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  ClipboardList,
  UserPlus,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Tipos
type Department = {
  id: number;
  name: string;
};

type Staff = {
  id: number;
  username: string;
  name: string;
  lastName?: string | null;
  email: string;
  status: string;
  role: string;
  position?: string | null;
  hireDate?: string | null;
  department?: Department | null;
  departmentId?: number | null;
};

interface StaffAttendance {
  id: number;
  date: string;
  status: string;
  checkInTime: string;
  checkOutTime?: string;
  notes?: string;
}

interface StaffSchedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface StaffDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadDate: string;
  expiryDate?: string;
}

type StaffDetailed = Staff & {
  schedules?: StaffSchedule[];
  documents?: StaffDocument[];
  attendance?: StaffAttendance[];
};

type StatusVariant =
  | "default"
  | "outline"
  | "secondary"
  | "destructive"
  | "success";

const statusMapping: Record<string, { label: string; variant: StatusVariant }> =
  {
    ACTIVE: { label: "Activo", variant: "success" },
    INACTIVE: { label: "Inactivo", variant: "destructive" },
    SUSPENDED: { label: "Suspendido", variant: "secondary" },
    ON_LEAVE: { label: "De permiso", variant: "outline" },
  };

const roleMapping: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuario",
  STAFF: "Staff",
  SUPERADMIN: "Super Admin",
  RECEPTIONIST: "Recepcionista",
  HOUSEKEEPING: "Limpieza",
  MAINTENANCE: "Mantenimiento",
};

interface StaffListProps {
  staffList: Staff[];
  departments: Department[];
  onStaffAdded?: () => Promise<void>;
  onStaffUpdated?: () => Promise<void>;
}

export function StaffList({
  staffList,
  departments,
  onStaffAdded,
  onStaffUpdated,
}: StaffListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffDetailed | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [detailsTab, setDetailsTab] = useState<string>("attendance");
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Reset password handler
  const handleResetPassword = async (staffId: number) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/reset-password`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || data.message || "Error al resetear contraseña"
        );
      toast.success(data.message || "Contraseña restablecida a 123456");
      if (onStaffUpdated) await onStaffUpdated();
    } catch (err: any) {
      toast.error(err.message || "Error al resetear contraseña");
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = staffList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(staffList.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchStaffDetails = async (
    staffId: number,
    tab: string = "attendance"
  ) => {
    try {
      setLoadingDetails(true);
      setDetailsTab(tab);
      const response = await fetch(`/api/staff/${staffId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch staff details");
      }

      const data = await response.json();
      setCurrentStaff(data);
      setShowDetailsModal(true);
    } catch {
      toast.error("Error al cargar detalles del empleado");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateStaff = async (formData: FormData) => {
    try {
      const staffData = {
        username: formData.get("username") as string,
        name: formData.get("name") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role: formData.get("role") as string,
        departmentId:
          formData.get("departmentId") &&
          formData.get("departmentId") !== "none"
            ? parseInt(formData.get("departmentId") as string)
            : null,
        position: (formData.get("position") as string) || null,
        hireDate: (formData.get("hireDate") as string) || null,
      };

      // Validate required fields
      if (
        !staffData.username ||
        !staffData.name ||
        !staffData.email ||
        !staffData.password
      ) {
        toast.error("Por favor complete todos los campos requeridos");
        return;
      }

      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create staff");
      }

      if (onStaffAdded) await onStaffAdded();
      setShowAddModal(false);
      toast.success("Empleado creado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al crear empleado");
    }
  };

  const handleUpdateStaff = async (formData: FormData) => {
    try {
      if (!currentStaff) return;

      const staffData = {
        name: formData.get("name") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as string,
        departmentId:
          formData.get("departmentId") &&
          formData.get("departmentId") !== "none"
            ? parseInt(formData.get("departmentId") as string)
            : null,
        position: (formData.get("position") as string) || null,
        status: formData.get("status") as string,
      };

      // Validate required fields
      if (!staffData.name || !staffData.email) {
        toast.error("Por favor complete todos los campos requeridos");
        return;
      }

      const response = await fetch(`/api/staff/${currentStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update staff");
      }

      if (onStaffUpdated) await onStaffUpdated();
      setShowEditModal(false);
      setCurrentStaff(null);
      toast.success("Empleado actualizado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar empleado");
    }
  };

  const handleChangeStatus = async (staffId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change status");
      }

      if (onStaffUpdated) await onStaffUpdated();
      toast.success("Estado actualizado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar el estado");
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">Personal ({staffList.length})</h3>
        <Button
          onClick={() => setShowAddModal(true)}
          className="md:w-auto w-full flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span className="md:inline">Nuevo Empleado</span>
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead className="hidden md:table-cell">Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">
                  Departamento
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {staff.name.charAt(0)}
                            {staff.lastName?.charAt(0) || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {staff.name} {staff.lastName || ""}
                          </p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {staff.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {staff.position || ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {staff.username}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {staff.email}
                    </TableCell>
                    <TableCell>
                      {roleMapping[staff.role] || staff.role}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {staff.department?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusMapping[staff.status]?.variant || "secondary"
                        }
                      >
                        {statusMapping[staff.status]?.label || staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchStaffDetails(staff.id)}
                          title="Ver detalles"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Detalles</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentStaff(staff);
                            setShowEditModal(true);
                          }}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResetPassword(staff.id)}
                          title="Restablecer contraseña"
                        >
                          <Key className="h-4 w-4" />
                          <span className="sr-only">
                            Restablecer contraseña
                          </span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cambiar estado"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Cambiar estado</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cambiar estado de {staff.name}{" "}
                                {staff.lastName || ""}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Seleccione el nuevo estado para este empleado.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid grid-cols-2 gap-2 py-4">
                              <Button
                                onClick={() => {
                                  handleChangeStatus(staff.id, "ACTIVE");
                                  document
                                    .getElementById("closeAlertDialog")
                                    ?.click();
                                }}
                                className="flex items-center gap-2"
                                variant="outline"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Activar
                              </Button>
                              <Button
                                onClick={() => {
                                  handleChangeStatus(staff.id, "INACTIVE");
                                  document
                                    .getElementById("closeAlertDialog")
                                    ?.click();
                                }}
                                className="flex items-center gap-2"
                                variant="outline"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                                Desactivar
                              </Button>
                              <Button
                                onClick={() => {
                                  handleChangeStatus(staff.id, "ON_LEAVE");
                                  document
                                    .getElementById("closeAlertDialog")
                                    ?.click();
                                }}
                                className="flex items-center gap-2"
                                variant="outline"
                              >
                                <Calendar className="h-4 w-4 text-blue-500" />
                                De permiso
                              </Button>
                              <Button
                                onClick={() => {
                                  handleChangeStatus(staff.id, "SUSPENDED");
                                  document
                                    .getElementById("closeAlertDialog")
                                    ?.click();
                                }}
                                className="flex items-center gap-2"
                                variant="outline"
                              >
                                <ClipboardList className="h-4 w-4 text-amber-500" />
                                Suspendido
                              </Button>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel id="closeAlertDialog">
                                Cancelar
                              </AlertDialogCancel>
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
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  paginate(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, and pages around current page
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, idx, array) => {
                // If there's a gap in the sequence, render an ellipsis
                const showEllipsisBefore = idx > 0 && page > array[idx - 1] + 1;
                const showEllipsisAfter =
                  idx < array.length - 1 && page < array[idx + 1] - 1;

                return (
                  <div key={page} className="flex items-center">
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          paginate(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                    {showEllipsisAfter && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </div>
                );
              })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  paginate(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Nuevo Empleado Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Empleado</DialogTitle>
            <DialogDescription>
              Ingrese los detalles del nuevo empleado.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateStaff(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario*</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="jdoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña*</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre*</Label>
                <Input id="name" name="name" placeholder="Juan" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" placeholder="Pérez" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan.perez@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol*</Label>
                <Select name="role" defaultValue="RECEPTIONIST">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="SUPERADMIN">Superadministrador</SelectItem>
                    <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
                    <SelectItem value="HOUSEKEEPER">Personal de limpieza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departamento</Label>
                <Select name="departmentId">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin departamento</SelectItem>
                    {departments.map((department) => (
                      <SelectItem
                        key={department.id}
                        value={department.id.toString()}
                      >
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Puesto</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Ej. Recepcionista Senior"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Fecha de contratación</Label>
                <Input id="hireDate" name="hireDate" type="date" />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Crear Empleado</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar Empleado Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>
              Actualice la información del empleado.
            </DialogDescription>
          </DialogHeader>

          {currentStaff && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStaff(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre*</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={currentStaff.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Apellido</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    defaultValue={currentStaff.lastName || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email*</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={currentStaff.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rol*</Label>
                  <Select name="role" defaultValue={currentStaff.role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="SUPERADMIN">Superadministrador</SelectItem>
                      <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
                      <SelectItem value="HOUSEKEEPER">Personal de limpieza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-departmentId">Departamento</Label>
                  <Select
                    name="departmentId"
                    defaultValue={
                      currentStaff.departmentId
                        ? currentStaff.departmentId.toString()
                        : "none"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin departamento</SelectItem>
                      {departments.map((department) => (
                        <SelectItem
                          key={department.id}
                          value={department.id.toString()}
                        >
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Puesto</Label>
                  <Input
                    id="edit-position"
                    name="position"
                    defaultValue={currentStaff.position || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={currentStaff.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                      <SelectItem value="ON_LEAVE">De permiso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentStaff(null);
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

      {/* Detalles del Empleado Modal */}
      <Dialog
        open={showDetailsModal}
        onOpenChange={(open) => {
          setShowDetailsModal(open);
          if (!open) setCurrentStaff(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : (
            currentStaff && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {currentStaff.name.charAt(0)}
                              {currentStaff.lastName?.charAt(0) || ""}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {currentStaff.name} {currentStaff.lastName || ""}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {roleMapping[currentStaff.role] || currentStaff.role}{" "}
                          - {currentStaff.position || "Sin puesto asignado"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              statusMapping[currentStaff.status]?.variant ||
                              "secondary"
                            }
                          >
                            {statusMapping[currentStaff.status]?.label ||
                              currentStaff.status}
                          </Badge>
                          {currentStaff.department && (
                            <Badge variant="outline">
                              {currentStaff.department.name}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm break-all">
                              {currentStaff.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Usuario:
                            </span>
                            <span className="text-sm">
                              {currentStaff.username}
                            </span>
                          </div>
                        </div>
                        {currentStaff.hireDate && (
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-sm font-medium">
                              Contratado:
                            </span>
                            <span className="text-sm">
                              {format(new Date(currentStaff.hireDate), "PP", {
                                locale: es,
                              })}
                              {" - "}
                              {formatDistanceToNow(
                                new Date(currentStaff.hireDate),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Tabs
                  value={detailsTab}
                  onValueChange={setDetailsTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                    <TabsTrigger value="schedules">Horarios</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="attendance"
                    className="border rounded-md p-4 mt-2"
                  >
                    {currentStaff.attendance &&
                    currentStaff.attendance.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Entrada</TableHead>
                              <TableHead>Salida</TableHead>
                              <TableHead>Notas</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentStaff.attendance.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>
                                  {format(new Date(record.date), "PP", {
                                    locale: es,
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      record.status === "PRESENT"
                                        ? "success"
                                        : record.status === "ABSENT"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {record.status === "PRESENT"
                                      ? "Presente"
                                      : record.status === "ABSENT"
                                      ? "Ausente"
                                      : record.status === "LATE"
                                      ? "Tarde"
                                      : record.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {format(
                                    new Date(record.checkInTime),
                                    "HH:mm"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {record.checkOutTime
                                    ? format(
                                        new Date(record.checkOutTime),
                                        "HH:mm"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell>{record.notes || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No hay registros de asistencia.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="schedules"
                    className="border rounded-md p-4 mt-2"
                  >
                    {currentStaff.schedules &&
                    currentStaff.schedules.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Día</TableHead>
                              <TableHead>Hora inicio</TableHead>
                              <TableHead>Hora fin</TableHead>
                              <TableHead>Recurrente</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentStaff.schedules.map((schedule) => (
                              <TableRow key={schedule.id}>
                                <TableCell>
                                  {
                                    [
                                      "Domingo",
                                      "Lunes",
                                      "Martes",
                                      "Miércoles",
                                      "Jueves",
                                      "Viernes",
                                      "Sábado",
                                    ][schedule.dayOfWeek]
                                  }
                                </TableCell>
                                <TableCell>
                                  {format(
                                    new Date(schedule.startTime),
                                    "HH:mm"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(schedule.endTime), "HH:mm")}
                                </TableCell>
                                <TableCell>
                                  {schedule.isRecurring ? "Sí" : "No"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No hay horarios asignados.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="documents"
                    className="border rounded-md p-4 mt-2"
                  >
                    {currentStaff.documents &&
                    currentStaff.documents.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Fecha carga</TableHead>
                              <TableHead>Fecha expiración</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentStaff.documents.map((document) => (
                              <TableRow key={document.id}>
                                <TableCell>{document.documentType}</TableCell>
                                <TableCell>
                                  <a
                                    href={document.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {document.documentName}
                                  </a>
                                </TableCell>
                                <TableCell>
                                  {format(new Date(document.uploadDate), "PP", {
                                    locale: es,
                                  })}
                                </TableCell>
                                <TableCell>
                                  {document.expiryDate
                                    ? format(
                                        new Date(document.expiryDate),
                                        "PP",
                                        {
                                          locale: es,
                                        }
                                      )
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No hay documentos asociados.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setCurrentStaff(null);
                    }}
                    variant="outline"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentStaff) {
                        setShowDetailsModal(false);
                        setShowEditModal(true);
                      }
                    }}
                  >
                    Editar Empleado
                  </Button>
                </DialogFooter>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
