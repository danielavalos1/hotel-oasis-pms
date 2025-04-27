"use client";

import useSWR, { mutate } from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { EditUserDialog } from "@/components/dashboard/edit-user-dialog";

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  shift?: string | null;
};

type ApiResponse = User[];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UsersList() {
  const { data, error, isLoading } = useSWR<ApiResponse>("/api/users", fetcher);
  const { toast } = useToast();

  const resetPassword = async (id: number) => {
    if (!confirm("¿Confirmas resetear contraseña a 123456?")) return;
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Contraseña reseteada", description: "La contraseña es 123456" });
      mutate("/api/users");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo resetear la contraseña" });
    }
  };

  if (error) return <div>Error al cargar empleados</div>;
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Empleados</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.shift || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <EditUserDialog userId={user.id} />
                  <Button variant="ghost" size="icon" onClick={() => resetPassword(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}