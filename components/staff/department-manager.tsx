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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

type Department = {
  id: number;
  name: string;
  description?: string | null;
  _count?: { users: number };
};

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/departments");
      if (!response.ok) throw new Error("Error al cargar departamentos");
      const data = await response.json();
      setDepartments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar departamentos");
      toast.error("Error al cargar departamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (formData: FormData) => {
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const response = await fetch("/api/staff/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear departamento");
      }
      await fetchDepartments();
      setShowAddModal(false);
      toast.success("Departamento creado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al crear departamento");
    }
  };

  const handleUpdateDepartment = async (formData: FormData) => {
    try {
      if (!currentDepartment) return;
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const response = await fetch(`/api/staff/departments/${currentDepartment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar departamento");
      }
      await fetchDepartments();
      setShowEditModal(false);
      setCurrentDepartment(null);
      toast.success("Departamento actualizado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar departamento");
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      const response = await fetch(`/api/staff/departments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar departamento");
      }
      await fetchDepartments();
      toast.success("Departamento eliminado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar departamento");
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
        <Button onClick={fetchDepartments} className="mt-4" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Intentar nuevamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Departamento</DialogTitle>
              <DialogDescription>Ingrese el nombre y descripción del departamento.</DialogDescription>
            </DialogHeader>
            <form action={handleCreateDepartment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre*</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Personal</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay departamentos registrados.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dept._count?.users ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={showEditModal && currentDepartment?.id === dept.id} onOpenChange={(open) => { setShowEditModal(open); if (!open) setCurrentDepartment(null); }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => { setCurrentDepartment(dept); setShowEditModal(true); }}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Departamento</DialogTitle>
                          <DialogDescription>Modifique los datos del departamento.</DialogDescription>
                        </DialogHeader>
                        <form action={handleUpdateDepartment} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre*</Label>
                            <Input id="edit-name" name="name" defaultValue={dept.name} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Input id="edit-description" name="description" defaultValue={dept.description || ""} />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit">Guardar Cambios</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Si hay personal asignado, no se podrá eliminar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleDeleteDepartment(dept.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}