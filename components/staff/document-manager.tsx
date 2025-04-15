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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, RefreshCcw, FileText } from "lucide-react";
import { toast } from "sonner";

type Employee = {
  id: number;
  name: string;
  lastName?: string | null;
};

type Document = {
  id: number;
  userId: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  expiryDate?: string | null;
  uploadDate: string;
  user?: Employee;
};

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/documents");
      if (!response.ok) throw new Error("Error al cargar documentos");
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar documentos");
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/staff?status=ACTIVE");
      if (!response.ok) throw new Error("Error al cargar empleados");
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      // Silenciar error
    }
  };

  const handleCreateDocument = async (formData: FormData) => {
    try {
      const userId = parseInt(formData.get("userId") as string);
      const documentType = formData.get("documentType") as string;
      const documentName = formData.get("documentName") as string;
      const documentUrl = formData.get("documentUrl") as string;
      const expiryDate = formData.get("expiryDate") as string;
      const payload: any = { userId, documentType, documentName, documentUrl };
      if (expiryDate) payload.expiryDate = expiryDate;
      const response = await fetch("/api/staff/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear documento");
      }
      await fetchDocuments();
      setShowAddModal(false);
      toast.success("Documento registrado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al crear documento");
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      const response = await fetch(`/api/staff/documents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar documento");
      }
      await fetchDocuments();
      toast.success("Documento eliminado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar documento");
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
        <Button onClick={fetchDocuments} className="mt-4" variant="outline">
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
              Nuevo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Documento</DialogTitle>
              <DialogDescription>Ingrese los datos del documento del empleado.</DialogDescription>
            </DialogHeader>
            <form action={handleCreateDocument} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Empleado*</Label>
                <select
                  id="userId"
                  name="userId"
                  className="w-full border rounded px-2 py-2"
                  required
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de documento*</Label>
                <Input id="documentType" name="documentType" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentName">Nombre*</Label>
                <Input id="documentName" name="documentName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentUrl">Enlace/URL*</Label>
                <Input id="documentUrl" name="documentUrl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                <Input id="expiryDate" name="expiryDate" type="date" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
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
              <TableHead>Tipo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Enlace</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay documentos registrados.
                </TableCell>
              </TableRow>
            ) : (
              documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell>
                    {doc.user?.name || ""} {doc.user?.lastName || ""}
                  </TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>{doc.documentName}</TableCell>
                  <TableCell>
                    {doc.expiryDate ? (
                      <Badge variant="outline">{doc.expiryDate}</Badge>
                    ) : (
                      <Badge variant="secondary">Sin vencimiento</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary underline"
                    >
                      <FileText className="h-4 w-4" />
                      Ver
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleDeleteDocument(doc.id)}>
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
