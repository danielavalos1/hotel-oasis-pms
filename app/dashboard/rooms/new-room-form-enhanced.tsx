"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

interface NewRoomFormProps {
  onSuccess: () => void;
}

const amenitiesOptions = [
  { id: "wifi", label: "WiFi gratuito" },
  { id: "tv", label: "TV LCD/LED" },
  { id: "ac", label: "Aire acondicionado" },
  { id: "minibar", label: "Minibar" },
  { id: "balcony", label: "Balcón" },
  { id: "ocean-view", label: "Vista al mar" },
  { id: "jacuzzi", label: "Jacuzzi" },
  { id: "kitchen", label: "Cocina/Cocineta" },
  { id: "workspace", label: "Área de trabajo" },
  { id: "safe", label: "Caja fuerte" },
  { id: "room-service", label: "Servicio a la habitación" },
  { id: "private-bathroom", label: "Baño privado" },
];

const roomSchema = z.object({
  roomNumber: z.string().min(1, "Número de habitación requerido"),
  type: z.enum(["SENCILLA", "SENCILLA_ESPECIAL", "DOBLE", "DOBLE_ESPECIAL", "SUITE_A", "SUITE_B"]),
  capacity: z.number().min(1, "Capacidad mínima de 1 persona").max(10, "Capacidad máxima de 10 personas"),
  pricePerNight: z.number().min(0, "El precio debe ser positivo"),
  description: z.string().optional(),
  floor: z.number().min(1, "Piso mínimo 1").max(10, "Piso máximo 10"),
  isAvailable: z.boolean().default(true),
  amenities: z.array(z.string()).default([]),
});

type RoomFormData = z.infer<typeof roomSchema>;

export function NewRoomForm({ onSuccess }: NewRoomFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: "",
      type: "SENCILLA",
      capacity: 1,
      pricePerNight: 0,
      description: "",
      floor: 1,
      isAvailable: true,
      amenities: [],
    },
  });

  async function onSubmit(data: RoomFormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear la habitación");
      }

      toast.success("Habitación creada exitosamente");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear la habitación");
    } finally {
      setIsLoading(false);
    }
  }

  const roomTypeLabels = {
    SENCILLA: "Sencilla",
    SENCILLA_ESPECIAL: "Sencilla Especial",
    DOBLE: "Doble",
    DOBLE_ESPECIAL: "Doble Especial",
    SUITE_A: "Suite A",
    SUITE_B: "Suite B",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roomNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Habitación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Habitación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(roomTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad (personas)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerNight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por Noche (MXN)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piso</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción de la habitación..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Disponible para Reservas</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Permite que esta habitación sea reservable
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Amenidades</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Selecciona las amenidades disponibles en esta habitación
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Habitación"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
