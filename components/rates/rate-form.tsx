"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RoomType, RateType } from "@prisma/client";

const rateSchema = z.object({
  roomId: z.number().min(1, "Selecciona una habitación"),
  name: z.string().min(1, "El nombre es requerido"),
  type: z.nativeEnum(RateType),
  subtotal: z.number().min(0, "El subtotal debe ser mayor a 0"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  validDays: z.array(z.string()).default([]),
  minNights: z.number().optional(),
  maxNights: z.number().optional(),
});

type RateFormData = z.infer<typeof rateSchema>;

// Tipo personalizado para el frontend que convierte Decimals a numbers
interface RoomRateWithRoom {
  id: number;
  roomId: number;
  name: string;
  type: RateType;
  basePrice: number;
  taxRate: number;
  serviceFeeRate: number;
  subtotal: number;
  taxAmount: number;
  serviceFeeAmount: number;
  totalPrice: number;
  isActive: boolean;
  isDefault: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;
  validDays: string[];
  minNights?: number | null;
  maxNights?: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  room: {
    id: number;
    roomNumber: string;
    type: RoomType;
  };
}

interface RateFormProps {
  rate?: RoomRateWithRoom | null;
  rooms: Array<{ id: number; roomNumber: string; type: RoomType }>;
  onSave: (rate: RoomRateWithRoom) => void;
  onCancel: () => void;
}

const rateTypeLabels = {
  BASE: "Base",
  SEASONAL: "Temporada",
  WEEKEND: "Fin de Semana",
  SPECIAL: "Especial",
};

const roomTypeLabels = {
  SENCILLA: "Sencilla",
  SENCILLA_ESPECIAL: "Sencilla Especial",
  DOBLE: "Doble",
  DOBLE_ESPECIAL: "Doble Especial",
  SUITE_A: "Suite A",
  SUITE_B: "Suite B",
};

const daysOfWeek = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
];

export function RateForm({ rate, rooms, onSave, onCancel }: RateFormProps) {
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    taxAmount: 0,
    serviceFeeAmount: 0,
    totalPrice: 0,
  });
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      roomId: rate?.roomId || 0,
      name: rate?.name || "",
      type: rate?.type || RateType.BASE,
      subtotal: rate?.subtotal || 0,
      isActive: rate?.isActive ?? true,
      isDefault: rate?.isDefault ?? false,
      validFrom: rate?.validFrom ? new Date(rate.validFrom).toISOString().split('T')[0] : "",
      validUntil: rate?.validUntil ? new Date(rate.validUntil).toISOString().split('T')[0] : "",
      validDays: rate?.validDays || [],
      minNights: rate?.minNights || undefined,
      maxNights: rate?.maxNights || undefined,
    },
  });

  const subtotal = watch("subtotal");
  const validDays = watch("validDays");

  // Calcular precios automáticamente
  useEffect(() => {
    const subtotalValue = Number(subtotal) || 0;
    const taxRate = 0.16; // 16% IVA
    const serviceFeeRate = 0.04; // 4% ISH
    
    const taxAmount = subtotalValue * taxRate;
    const serviceFeeAmount = subtotalValue * serviceFeeRate;
    const totalPrice = subtotalValue + taxAmount + serviceFeeAmount;

    setCalculations({
      subtotal: subtotalValue,
      taxAmount,
      serviceFeeAmount,
      totalPrice,
    });
  }, [subtotal]);

  const onSubmit = async (data: RateFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
        minNights: data.minNights || null,
        maxNights: data.maxNights || null,
      };

      const url = rate ? `/api/rates/${rate.id}` : "/api/rates";
      const method = rate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedRate = await response.json();
        onSave(savedRate);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar la tarifa");
      }
    } catch (error) {
      console.error("Error saving rate:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la tarifa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayValue: string) => {
    const currentDays = validDays || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue];
    setValue("validDays", newDays);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rate ? "Editar Tarifa" : "Nueva Tarifa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId">Habitación</Label>
                <Select
                  value={String(watch("roomId"))}
                  onValueChange={(value) => setValue("roomId", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una habitación" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {room.roomNumber} - {roomTypeLabels[room.type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomId && (
                  <p className="text-sm text-red-500 mt-1">{errors.roomId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Nombre de la Tarifa</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ej: Tarifa Base, Fin de Semana, Temporada Alta"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Tipo de Tarifa</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value) => setValue("type", value as RateType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(rateTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subtotal">Subtotal (antes de impuestos)</Label>
                <Input
                  id="subtotal"
                  type="number"
                  step="0.01"
                  {...register("subtotal", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.subtotal && (
                  <p className="text-sm text-red-500 mt-1">{errors.subtotal.message}</p>
                )}
              </div>

              {/* Cálculos automáticos */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculations.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span>${calculations.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ISH (4%):</span>
                  <span>${calculations.serviceFeeAmount.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span className="text-lg">${calculations.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", !!checked)}
                  />
                  <Label htmlFor="isActive">Activa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDefault"
                    checked={watch("isDefault")}
                    onCheckedChange={(checked) => setValue("isDefault", !!checked)}
                  />
                  <Label htmlFor="isDefault">Tarifa por defecto</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Válida desde</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    {...register("validFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Válida hasta</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    {...register("validUntil")}
                  />
                </div>
              </div>

              <div>
                <Label>Días válidos</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-1">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={validDays?.includes(day.value) || false}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-xs">
                        {day.label.slice(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minNights">Noches mínimas</Label>
                  <Input
                    id="minNights"
                    type="number"
                    {...register("minNights", { valueAsNumber: true })}
                    placeholder="Sin límite"
                  />
                </div>
                <div>
                  <Label htmlFor="maxNights">Noches máximas</Label>
                  <Input
                    id="maxNights"
                    type="number"
                    {...register("maxNights", { valueAsNumber: true })}
                    placeholder="Sin límite"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : rate ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
