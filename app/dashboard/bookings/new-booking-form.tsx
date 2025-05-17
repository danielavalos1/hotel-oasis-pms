"use client";

import { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { AutocompleteGuest } from "@/components/ui/autocomplete-guest";
import { useGuestSearch } from "@/hooks/use-guest-search";
import {
  BookingFormValues,
  RoomOption,
  FormattedBookingPayload,
  roomTypeLabels,
} from "@/types/booking-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoomType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación para el formulario
const bookingFormSchema = z.object({
  guestName: z.string().min(2, "El nombre es obligatorio"),
  guestEmail: z.string().email("Email inválido"),
  guestPhone: z.string().min(10, "El teléfono es obligatorio"),
  checkIn: z.date({ required_error: "La fecha de llegada es obligatoria" }),
  checkOut: z.date({ required_error: "La fecha de salida es obligatoria" }),
  adults: z.string().min(1, "Seleccione el número de adultos"),
  children: z.string(),
  rooms: z
    .array(
      z.object({
        roomType: z.string().min(1, "Seleccione el tipo de habitación"),
        roomId: z.string().min(1, "Debe seleccionar una habitación"),
      })
    )
    .min(1, "Debe añadir al menos una habitación"),
  notes: z.string().optional(),
});

interface NewBookingFormProps {
  onSuccess: () => void;
}

export function NewBookingForm({ onSuccess }: NewBookingFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [isSearchingRooms, setIsSearchingRooms] = useState(false);
  const [canSelectRooms, setCanSelectRooms] = useState(false);

  // Estado para controlar el popover de los calendarios (debe estar solo una vez)
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);

  // Estado para habitaciones disponibles por tipo
  const [roomOptionsByType, setRoomOptionsByType] = useState<
    Record<string, RoomOption[]>
  >({});

  // Hook personalizado para la búsqueda de huéspedes
  const {
    selectedGuest,
    searchInput,
    searchResults,
    isSearching,
    searchGuests,
    selectGuest,
  } = useGuestSearch();

  // Inicializar el formulario con validación
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      checkIn: null,
      checkOut: null,
      adults: "1",
      children: "0",
      rooms: [{ roomType: "", roomId: "" }],
      notes: "",
    },
  });

  // Field array for multiple rooms
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  // Valores de watch para efectos
  const checkInValue = form.watch("checkIn");
  const checkOutValue = form.watch("checkOut");
  const adultsValue = form.watch("adults");
  const childrenValue = form.watch("children");

  // Capacidad base por habitación (puede venir de RoomOption)
  const getRoomCapacity = (roomId: string) => {
    const room = availableRooms.find((r) => r.id.toString() === roomId);
    return room?.capacity ?? 2; // fallback a 2 si no se encuentra
  };

  // Suma la capacidad total de las habitaciones seleccionadas
  const totalCapacity = fields.reduce((sum, _, index) => {
    const id = form.getValues(`rooms.${index}.roomId`);
    return sum + getRoomCapacity(id);
  }, 0);

  // Suma total de huéspedes
  const totalGuests = Number(adultsValue) + Number(childrenValue);

  // Alerta si la capacidad es insuficiente
  useEffect(() => {
    if (fields.length > 0 && totalCapacity < totalGuests) {
      toast({
        title: "Capacidad insuficiente",
        description: `La capacidad total de las habitaciones seleccionadas (${totalCapacity}) es menor que el número de huéspedes (${totalGuests}). Añade más habitaciones.`,
        variant: "destructive",
      });
    }
  }, [fields.length, totalCapacity, totalGuests]);

  // Al eliminar una habitación, verifica la capacidad
  const handleRemoveRoom = (index: number) => {
    remove(index);
    setTimeout(() => {
      const newCapacity = fields.reduce((sum, _, idx) => {
        if (idx === index) return sum; // omitida
        const id = form.getValues(`rooms.${idx}.roomId`);
        return sum + getRoomCapacity(id);
      }, 0);
      if (newCapacity < totalGuests) {
        toast({
          title: "Capacidad insuficiente",
          description: `La capacidad total de las habitaciones seleccionadas (${newCapacity}) es menor que el número de huéspedes (${totalGuests}). Añade más habitaciones.`,
          variant: "destructive",
        });
      }
    }, 100);
  };

  // Preparar los datos para enviar al API
  const formatBookingData = (
    data: BookingFormValues
  ): FormattedBookingPayload => {
    const checkInStr = data.checkIn
      ? data.checkIn.toISOString().split("T")[0]
      : "";
    const checkOutStr = data.checkOut
      ? data.checkOut.toISOString().split("T")[0]
      : "";

    // Calcular el número de noches
    const nights =
      data.checkIn && data.checkOut
        ? Math.ceil(
            (data.checkOut.getTime() - data.checkIn.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 1;

    // Construir arreglo de rooms con precios
    const roomsPayload = data.rooms.map((r) => {
      const sel = availableRooms.find((ar) => ar.id.toString() === r.roomId);
      return {
        roomId: sel ? sel.id : 0,
        priceAtTime: sel ? sel.pricePerNight : 0,
      };
    });
    const totalPrice = roomsPayload.reduce(
      (sum, r) => sum + r.priceAtTime * nights,
      0
    );

    // Preparar payload adaptado al formato que espera el API
    return {
      rooms: roomsPayload,
      checkInDate: checkInStr,
      checkOutDate: checkOutStr,
      totalPrice,
      status: "confirmed",
      numberOfGuests: Number(data.adults) + Number(data.children || "0"),
      guest: selectedGuest
        ? { id: selectedGuest.id }
        : {
            firstName: data.guestName.split(" ")[0] || data.guestName,
            lastName: data.guestName.split(" ").slice(1).join(" ") || "",
            email: data.guestEmail,
            phoneNumber: data.guestPhone,
          },
    };
  };

  const { toast } = useToast();

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsLoading(true);

      // Construir payload para multi-room API (agrupa por tipo y cantidad)
      const basePayload = formatBookingData(data);
      // Solo contar habitaciones con roomType válido
      const counts: Record<string, number> = {};
      data.rooms.forEach((r) => {
        if (r.roomType && r.roomType !== "") {
          // Asegura que el roomType sea el valor del enum (mayúsculas)
          const typeKey = r.roomType.toUpperCase() as RoomType;
          counts[typeKey] = (counts[typeKey] || 0) + 1;
        }
      });
      // Solo incluir roomTypes válidos
      const rooms = Object.entries(counts)
        .filter(([roomType]) => !!roomType)
        .map(([roomType, quantity]) => ({
          roomType,
          quantity,
        }));
      if (rooms.length === 0) {
        throw new Error(
          "Debes seleccionar al menos un tipo de habitación válido"
        );
      }
      const payload = { ...basePayload, rooms };

      // Llamada al nuevo endpoint multi-room
      const response = await fetch("/api/bookings/multi-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la reserva");
      }

      toast({
        title: "Reserva creada",
        description: "La reserva se creó exitosamente.",
        variant: "default",
      });
      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Error al crear reserva",
        description:
          error instanceof Error
            ? error.message
            : "Error al procesar la reserva",
        variant: "destructive",
      });
      console.error("Error al crear reserva:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cuando se selecciona un huésped
  useEffect(() => {
    if (selectedGuest) {
      form.setValue(
        "guestName",
        `${selectedGuest.firstName} ${selectedGuest.lastName}`
      );
      form.setValue("guestEmail", selectedGuest.email);
      form.setValue("guestPhone", selectedGuest.phoneNumber || "");
    }
  }, [selectedGuest, form]);

  // Auto-ajustar número de habitaciones según huespedes (capacidad base 2)
  useEffect(() => {
    const adults = Number(adultsValue);
    const children = Number(childrenValue);
    const totalGuests = adults + children;
    const roomsCount = Math.max(1, Math.ceil(totalGuests / 2));
    if (fields.length !== roomsCount) {
      replace(Array(roomsCount).fill({ roomType: "", roomId: "" }));
    }
  }, [adultsValue, childrenValue, fields.length, replace]);

  // Calcular noches y precio total para UI
  const nights =
    checkInValue && checkOutValue
      ? Math.ceil(
          (checkOutValue.getTime() - checkInValue.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = fields.reduce((sum, _, index) => {
    const id = form.getValues(`rooms.${index}.roomId`);
    const room = availableRooms.find((r) => r.id.toString() === id);
    return sum + (room ? room.pricePerNight * nights : 0);
  }, 0);

  // Buscar habitaciones disponibles por tipo y fechas cuando se selecciona un tipo
  const fetchRoomsByType = async (roomType: string) => {
    const checkIn = form.getValues("checkIn");
    const checkOut = form.getValues("checkOut");
    if (!roomType || !checkIn || !checkOut) return;
    const start = checkIn.toISOString().split("T")[0];
    const end = checkOut.toISOString().split("T")[0];
    const url = `/api/rooms/available?checkIn=${start}&checkOut=${end}&roomType=${roomType}`;
    const res = await fetch(url, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "key1",
      },
    }).then((r) => r.json());
    if (res.success) {
      setRoomOptionsByType((prev) => ({ ...prev, [roomType]: res.data }));
    } else {
      setRoomOptionsByType((prev) => ({ ...prev, [roomType]: [] }));
    }
  };

  // Efecto para buscar habitaciones cuando cambia el tipo en cada campo
  useEffect(() => {
    fields.forEach((field, index) => {
      const selectedType = form.watch(`rooms.${index}.roomType`);
      if (selectedType && !roomOptionsByType[selectedType]) {
        fetchRoomsByType(selectedType);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fields.map((_, i) => form.watch(`rooms.${i}.roomType`)).join(","),
    form.getValues("checkIn"),
    form.getValues("checkOut"),
  ]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="room" disabled={!canSelectRooms}>
            Habitación
          </TabsTrigger>
          <TabsTrigger value="payment" disabled={!canSelectRooms}>
            Pago
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TabsContent value="details" className="space-y-4">
              <FormItem>
                <FormLabel>Buscar huésped</FormLabel>
                <AutocompleteGuest
                  value={selectedGuest}
                  onChange={selectGuest}
                  onInputChange={searchGuests}
                  inputValue={searchInput}
                  isLoading={isSearching}
                  results={searchResults}
                  placeholder="Buscar por nombre, apellido o email"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Busca un huésped existente o ingresa los datos a continuación
                  para un nuevo huésped
                </p>
              </FormItem>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre y apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="guestPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+52 55 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de llegada</FormLabel>
                      <Popover open={openCheckIn} onOpenChange={setOpenCheckIn}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal flex h-10 items-center",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value.toISOString())
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => {
                              console.log(
                                "[Calendar] Día seleccionado (checkIn):",
                                date
                              );
                              field.onChange(date);
                              if (date) setOpenCheckIn(false);
                            }}
                            initialFocus
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            className="rounded-md border shadow-sm bg-background"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de salida</FormLabel>
                      <Popover
                        open={openCheckOut}
                        onOpenChange={setOpenCheckOut}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal flex h-10 items-center",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value.toISOString())
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => {
                              console.log(
                                "[Calendar] Día seleccionado (checkOut):",
                                date
                              );
                              field.onChange(date);
                              if (date) setOpenCheckOut(false);
                            }}
                            initialFocus
                            fromDate={
                              form.getValues("checkIn")
                                ? new Date(
                                    form.getValues("checkIn")!.getTime() +
                                      86400000
                                  )
                                : new Date()
                            }
                            disabled={(date) => {
                              const checkIn = form.getValues("checkIn");
                              if (checkIn) {
                                return date <= checkIn;
                              }
                              return (
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              );
                            }}
                            className="rounded-md border shadow-sm bg-background"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adultos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="Cantidad de adultos"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(
                              val === "" ? "" : String(Math.max(1, Number(val)))
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niños</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Cantidad de niños"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(
                              val === ""
                                ? "0"
                                : String(Math.max(0, Number(val)))
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="room" className="space-y-4">
              {/* Multiples habitaciones - responsivo y scrollable */}
              <div className="flex flex-col gap-4 max-h-[60vh] md:max-h-[50vh] overflow-y-auto pr-1">
                {fields.map((field, index) => {
                  const selectedType = form.watch(`rooms.${index}.roomType`);
                  return (
                    <div
                      key={field.id}
                      className="border p-4 rounded space-y-2 bg-background/80"
                    >
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-base">
                          Habitación {index + 1}
                        </h4>
                        {fields.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRoom(index)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.roomType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tipo de habitación" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(roomTypeLabels).map(
                                      ([v, label]) => (
                                        <SelectItem key={v} value={v}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.roomId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Habitación</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={
                                    !roomOptionsByType[selectedType] ||
                                    !roomOptionsByType[selectedType].length
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        isSearchingRooms
                                          ? "Buscando..."
                                          : roomOptionsByType[selectedType]
                                              ?.length
                                          ? "Seleccionar habitación"
                                          : "Sin opciones"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roomOptionsByType[selectedType]?.map(
                                      (r) => (
                                        <SelectItem
                                          key={r.id}
                                          value={r.id.toString()}
                                        >
                                          {r.roomNumber} - $
                                          {r.pricePerNight.toFixed(2)}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ roomType: "", roomId: "" })}
                >
                  Añadir habitación
                </Button>
                <div className="text-sm text-muted-foreground mt-2">
                  Capacidad total seleccionada:{" "}
                  <span className="font-semibold">{totalCapacity}</span> |
                  Huéspedes:{" "}
                  <span className="font-semibold">{totalGuests}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Resumen de reserva</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Huésped:</span>
                    <span className="font-medium">
                      {form.getValues("guestName") || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{form.getValues("guestEmail") || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span>
                      {form.getValues("checkIn")
                        ? formatDate(form.getValues("checkIn")!.toISOString())
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span>
                      {form.getValues("checkOut")
                        ? formatDate(form.getValues("checkOut")!.toISOString())
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración:</span>
                    <span>
                      {nights} {nights === 1 ? "noche" : "noches"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitaciones:</span>
                    <span>
                      {fields
                        .map((_, index) => {
                          const roomId = form.getValues(
                            `rooms.${index}.roomId`
                          );
                          const room = availableRooms.find(
                            (r) => r.id.toString() === roomId
                          );
                          return room
                            ? `${room.roomNumber} (${
                                roomTypeLabels[room.roomType] || room.roomType
                              })`
                            : "-";
                        })
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Huéspedes:</span>
                    <span>
                      {form.getValues("adults") || 0} adultos
                      {Number(form.getValues("children")) > 0
                        ? `, ${form.getValues("children")} niños`
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-lg">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {fields
                      .map((_, index) => {
                        const roomId = form.getValues(`rooms.${index}.roomId`);
                        const room = availableRooms.find(
                          (r) => r.id.toString() === roomId
                        );
                        return room
                          ? `${room.pricePerNight.toFixed(
                              2
                            )} × ${nights} noches`
                          : "";
                      })
                      .join(", ")}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Se procesará un cargo de pre-autorización equivalente al 30%
                  del total de la reserva. El saldo restante se cargará al
                  momento del check-in.
                </p>
                {/* En un caso real aquí iría el formulario de pago */}
              </div>
            </TabsContent>

            <div className="flex justify-between mt-6">
              {activeTab !== "details" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setActiveTab(activeTab === "room" ? "details" : "room")
                  }
                >
                  Atrás
                </Button>
              )}

              {activeTab !== "payment" ? (
                <Button
                  type="button"
                  onClick={async () => {
                    if (activeTab === "details") {
                      const valid = await form.trigger([
                        "guestName",
                        "guestEmail",
                        "guestPhone",
                        "checkIn",
                        "checkOut",
                        "adults",
                        "children",
                      ]);
                      if (!valid) return;
                      // Buscar habitaciones disponibles solo si los detalles son válidos
                      const checkIn = form.getValues("checkIn");
                      const checkOut = form.getValues("checkOut");
                      const adults = Number(form.getValues("adults"));
                      const children = Number(form.getValues("children"));
                      const totalGuests = adults + children;
                      if (checkIn && checkOut && totalGuests > 0) {
                        setIsSearchingRooms(true);
                        const start = checkIn.toISOString().split("T")[0];
                        const end = checkOut.toISOString().split("T")[0];
                        const url = `/api/rooms/available?checkIn=${start}&checkOut=${end}&guests=${totalGuests}`;
                        const res = await fetch(url, {
                          headers: {
                            "x-api-key":
                              process.env.NEXT_PUBLIC_API_KEY || "key1",
                          },
                        }).then((r) => r.json());
                        if (res.success) {
                          setAvailableRooms(res.data);
                          setCanSelectRooms(true);
                          if (!res.data.length) {
                            toast({
                              title: "Advertencia",
                              description:
                                "No hay habitaciones disponibles para las fechas y huéspedes seleccionados",
                              variant: "destructive",
                            });
                            return;
                          }
                          setActiveTab("room");
                        } else {
                          setAvailableRooms([]);
                          setCanSelectRooms(false);
                          toast({
                            title: "Error",
                            description:
                              "Error al buscar habitaciones disponibles",
                            variant: "destructive",
                          });
                          return;
                        }
                        setIsSearchingRooms(false);
                      }
                    } else if (activeTab === "room") {
                      const triggers = fields.flatMap(
                        (_, i) =>
                          [`rooms.${i}.roomType`, `rooms.${i}.roomId`] as const
                      );
                      const valid = await form.trigger(triggers);
                      if (!valid) return;
                      setActiveTab("payment");
                    }
                  }}
                  disabled={isSearchingRooms}
                >
                  Continuar
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Procesando..." : "Completar Reserva"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
