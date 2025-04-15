"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface NewBookingFormProps {
  onSuccess: () => void;
}

export function NewBookingForm({ onSuccess }: NewBookingFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      checkIn: null as Date | null,
      checkOut: null as Date | null,
      adults: "1",
      children: "0",
      roomType: "",
      notes: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Booking data:", data);
      setIsLoading(false);
      toast.success("Reserva creada exitosamente");
      onSuccess();
    }, 1000);
  };
  
  const getNextTab = () => {
    if (activeTab === "details") return "room";
    if (activeTab === "room") return "payment";
    return "details";
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="room">Habitación</TabsTrigger>
          <TabsTrigger value="payment">Pago</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
            <TabsContent value="details" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  rules={{ required: "El nombre es obligatorio" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestEmail"
                  rules={{ 
                    required: "El email es obligatorio",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    }
                  }}
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
                rules={{ required: "El teléfono es obligatorio" }}
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
                  rules={{ required: "La fecha de llegada es obligatoria" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de llegada</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
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
                            onSelect={field.onChange}
                            initialFocus
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
                  rules={{ required: "La fecha de salida es obligatoria" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de salida</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
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
                            onSelect={field.onChange}
                            initialFocus
                            disabled={date => 
                              form.getValues("checkIn") ? 
                                date < form.getValues("checkIn")! : 
                                false
                            }
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niños</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="room" className="space-y-4">
              <FormField
                control={form.control}
                name="roomType"
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
                          <SelectValue placeholder="Seleccionar tipo de habitación" />
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
              
              <div className="grid grid-cols-1 gap-4">
                {form.watch("roomType") && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">
                      {form.watch("roomType") === "standard" && "Habitación Estándar"}
                      {form.watch("roomType") === "deluxe" && "Habitación Deluxe"}
                      {form.watch("roomType") === "suite" && "Suite"}
                      {form.watch("roomType") === "presidential" && "Suite Presidencial"}
                    </h3>
                    <div className="text-sm text-muted-foreground mb-4">
                      {form.watch("roomType") === "standard" && "Habitación con cama doble, baño privado y vista a la ciudad."}
                      {form.watch("roomType") === "deluxe" && "Habitación espaciosa con cama king, baño con tina y vista panorámica."}
                      {form.watch("roomType") === "suite" && "Suite con dormitorio separado, sala de estar, jacuzzi y terraza privada."}
                      {form.watch("roomType") === "presidential" && "Suite de lujo con sala comedor, servicio de mayordomo y terraza con vista al mar."}
                    </div>
                    <div className="flex justify-between">
                      <span>Precio por noche:</span>
                      <span className="font-medium">
                        {form.watch("roomType") === "standard" && "$120"}
                        {form.watch("roomType") === "deluxe" && "$180"}
                        {form.watch("roomType") === "suite" && "$250"}
                        {form.watch("roomType") === "presidential" && "$450"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas especiales</FormLabel>
                    <FormControl>
                      <Input placeholder="Solicitudes especiales, alergias, etc." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Resumen de reserva</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Huésped:</span>
                    <span>{form.getValues("guestName") || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span>{form.getValues("checkIn") ? formatDate(form.getValues("checkIn")!.toISOString()) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span>{form.getValues("checkOut") ? formatDate(form.getValues("checkOut")!.toISOString()) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitación:</span>
                    <span>
                      {form.watch("roomType") === "standard" && "Estándar"}
                      {form.watch("roomType") === "deluxe" && "Deluxe"}
                      {form.watch("roomType") === "suite" && "Suite"}
                      {form.watch("roomType") === "presidential" && "Presidencial"}
                      {!form.watch("roomType") && "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Huéspedes:</span>
                    <span>{form.getValues("adults") || 0} adultos, {form.getValues("children") || 0} niños</span>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      {form.watch("checkIn") && form.watch("checkOut") && form.watch("roomType") ? (
                        `$${calculateTotal(form.watch("checkIn")!, form.watch("checkOut")!, form.watch("roomType")!)}`
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Se procesará un cargo de pre-autorización equivalente al 30% del total de la reserva.
                  El saldo restante se cargará al momento del check-in.
                </p>
                
                {/* En un caso real aquí iría el formulario de pago */}
              </div>
            </TabsContent>
            
            <div className="flex justify-between mt-6">
              {activeTab !== "details" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === "room" ? "details" : "room")}
                >
                  Atrás
                </Button>
              )}
              
              {activeTab !== "payment" ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab(getNextTab())}
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

// Helper function to calculate total based on room type and dates
function calculateTotal(checkIn: Date, checkOut: Date, roomType: string): string {
  const prices: Record<string, number> = {
    standard: 120,
    deluxe: 180,
    suite: 250,
    presidential: 450,
  };
  
  const nightsStay = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const total = prices[roomType] * nightsStay;
  
  return total.toFixed(2);
}