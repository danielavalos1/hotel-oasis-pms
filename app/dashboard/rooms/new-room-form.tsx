"use client";

import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

interface NewRoomFormProps {
  onSuccess: () => void;
}

const amenitiesOptions = [
  { id: "wifi", label: "WiFi" },
  { id: "tv", label: "TV" },
  { id: "ac", label: "A/C" },
  { id: "minibar", label: "Minibar" },
  { id: "balcony", label: "Balcony" },
  { id: "ocean-view", label: "Ocean View" },
  { id: "jacuzzi", label: "Jacuzzi" },
  { id: "kitchen", label: "Kitchen" },
  { id: "workspace", label: "Workspace" },
];

export function NewRoomForm({ onSuccess }: NewRoomFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      number: "",
      floor: "",
      type: "",
      capacity: "",
      pricePerNight: "",
      amenities: [] as string[],
      description: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Room data:", data);
      setIsLoading(false);
      toast.success("Habitación creada exitosamente");
      onSuccess();
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            rules={{
              required: "El número de habitación es obligatorio",
              pattern: {
                value: /^[1-9]\d{2}$/,
                message: "El formato debe ser de 3 dígitos (ej. 101, 204)",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de habitación</FormLabel>
                <FormControl>
                  <Input placeholder="101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floor"
            rules={{ required: "El piso es obligatorio" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar piso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Piso 1</SelectItem>
                    <SelectItem value="2">Piso 2</SelectItem>
                    <SelectItem value="3">Piso 3</SelectItem>
                    <SelectItem value="4">Piso 4</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            rules={{ required: "El tipo de habitación es obligatorio" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de habitación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Estándar</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="presidential">Presidencial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            rules={{ required: "La capacidad es obligatoria" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar capacidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 persona</SelectItem>
                    <SelectItem value="2">2 personas</SelectItem>
                    <SelectItem value="3">3 personas</SelectItem>
                    <SelectItem value="4">4 personas</SelectItem>
                    <SelectItem value="5">5 personas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="pricePerNight"
          rules={{
            required: "El precio por noche es obligatorio",
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: "Ingrese un precio válido",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio por noche (USD)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Amenidades</FormLabel>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenitiesOptions.map((amenity) => (
                  <FormField
                    key={amenity.id}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={amenity.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(amenity.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, amenity.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== amenity.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {amenity.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Descripción detallada de la habitación..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
