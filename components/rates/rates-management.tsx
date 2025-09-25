"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoomType, RateType } from "@prisma/client";
import { RateForm } from "./rate-form";
import { RatesList } from "./rates-list";

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

export function RatesManagement() {
  const [rates, setRates] = useState<RoomRateWithRoom[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: number; roomNumber: string; type: RoomType }>>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<RoomRateWithRoom | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [selectedRateType, setSelectedRateType] = useState<string>("all");
  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    loadRates();
    loadRooms();
  }, []);

  const loadRates = async () => {
    try {
      const response = await fetch("/api/rates");
      if (response.ok) {
        const data = await response.json();
        setRates(data.rates || []);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las tarifas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading rates:", error);
      toast({
        title: "Error",
        description: "Error de conexión al cargar tarifas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || []);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const handleCreateRate = () => {
    setEditingRate(null);
    setIsFormOpen(true);
  };

  const handleEditRate = (rate: RoomRateWithRoom) => {
    setEditingRate(rate);
    setIsFormOpen(true);
  };

  const handleDeleteRate = async (rateId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarifa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rates/${rateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Tarifa eliminada",
          description: "La tarifa se eliminó correctamente",
        });
        loadRates();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarifa",
        variant: "destructive",
      });
    }
  };

  const handleSaveRate = (savedRate: RoomRateWithRoom) => {
    toast({
      title: editingRate ? "Tarifa actualizada" : "Tarifa creada",
      description: `La tarifa se ${editingRate ? "actualizó" : "creó"} correctamente`,
    });
    setIsFormOpen(false);
    setEditingRate(null);
    loadRates();
  };

  // Filtrar tarifas
  const filteredRates = rates.filter((rate) => {
    const roomTypeMatch = selectedRoomType === "all" || rate.room.type === selectedRoomType;
    const rateTypeMatch = selectedRateType === "all" || rate.type === selectedRateType;
    return roomTypeMatch && rateTypeMatch;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tarifas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tarifas por Habitación</h3>
        <Button onClick={handleCreateRate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarifa
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="room-type-filter">Tipo de Habitación</Label>
          <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(roomTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="rate-type-filter">Tipo de Tarifa</Label>
          <Select value={selectedRateType} onValueChange={setSelectedRateType}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tarifa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(rateTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Vista en Tarjetas</TabsTrigger>
          <TabsTrigger value="table">Vista en Tabla</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRates.map((rate) => (
              <Card key={rate.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Habitación {rate.room.roomNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {roomTypeLabels[rate.room.type as keyof typeof roomTypeLabels]}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRate(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRate(rate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{rate.name}</span>
                    <Badge variant={rate.isDefault ? "default" : "secondary"}>
                      {rateTypeLabels[rate.type as keyof typeof rateTypeLabels]}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precio base:</span>
                      <span>${typeof rate.basePrice === 'number' ? rate.basePrice.toFixed(2) : rate.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (16%):</span>
                      <span>${typeof rate.taxAmount === 'number' ? rate.taxAmount.toFixed(2) : rate.taxAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ISH (4%):</span>
                      <span>${typeof rate.serviceFeeAmount === 'number' ? rate.serviceFeeAmount.toFixed(2) : rate.serviceFeeAmount}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="text-lg">${typeof rate.totalPrice === 'number' ? rate.totalPrice.toFixed(2) : rate.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {rate.isActive && (
                      <Badge variant="outline" className="text-green-600">
                        Activa
                      </Badge>
                    )}
                    {rate.isDefault && (
                      <Badge variant="outline" className="text-blue-600">
                        Por defecto
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <RatesList 
            rates={filteredRates}
            onEdit={handleEditRate}
            onDelete={handleDeleteRate}
          />
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <RateForm
          rate={editingRate}
          rooms={rooms}
          onSave={handleSaveRate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingRate(null);
          }}
        />
      )}
    </div>
  );
}
