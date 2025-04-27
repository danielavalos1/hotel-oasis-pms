"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "@/validations/user";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mutate } from "swr";
import type { UserRole } from "@prisma/client";

type FormValues = z.infer<typeof updateUserSchema>;

export function EditUserDialog({ userId }: { userId: number }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState<Partial<FormValues>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { id: userId, ...initial },
  });

  useEffect(() => {
    if (open) {
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          form.reset({
            id: userId,
            username: data.username,
            name: data.name,
            email: data.email,
            role: data.role,
            shift: data.shift || undefined,
          });
        });
    }
  }, [open, userId]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Usuario actualizado" });
      mutate("/api/users");
      setOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Error al actualizar usuario" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          {/* Icono de edición */}
          ✏️
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {/* Campos del formulario */}
          <input type="hidden" {...form.register("id")} />
          <div>
            <label>Usuario</label>
            <Input {...form.register("username")} disabled={loading} />
            <p className="text-sm text-red-600">{form.formState.errors.username?.message}</p>
          </div>
          <div>
            <label>Nombre</label>
            <Input {...form.register("name")} disabled={loading} />
            <p className="text-sm text-red-600">{form.formState.errors.name?.message}</p>
          </div>
          <div>
            <label>Correo</label>
            <Input {...form.register("email")} disabled={loading} />
            <p className="text-sm text-red-600">{form.formState.errors.email?.message}</p>
          </div>
          <div>
            <label>Rol</label>
            <Select
              onValueChange={(v) => form.setValue("role", v as UserRole)}
              value={form.getValues("role")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-red-600">{form.formState.errors.role?.message}</p>
          </div>
          <div>
            <label>Turno</label>
            <Select
              onValueChange={(v) => form.setValue("shift", v)}
              value={form.getValues("shift") || ""}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mañana">Mañana</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noche">Noche</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-red-600">{form.formState.errors.shift?.message}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={loading}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}