"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Check, X } from "lucide-react";
import { RoomType, RateType } from "@prisma/client";

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

interface RatesListProps {
  rates: RoomRateWithRoom[];
  onEdit: (rate: RoomRateWithRoom) => void;
  onDelete: (rateId: number) => void;
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

const daysOfWeekLabels = {
  "0": "Dom",
  "1": "Lun",
  "2": "Mar",
  "3": "Mié",
  "4": "Jue",
  "5": "Vie",
  "6": "Sáb",
};

export function RatesList({ rates, onEdit, onDelete }: RatesListProps) {
  const formatValidDays = (validDays: string[]) => {
    if (validDays.length === 0) return "Todos los días";
    if (validDays.length === 7) return "Todos los días";
    
    return validDays
      .sort((a, b) => Number(a) - Number(b))
      .map(day => daysOfWeekLabels[day as keyof typeof daysOfWeekLabels])
      .join(", ");
  };

  const formatDateRange = (validFrom?: Date | null, validUntil?: Date | null) => {
    if (!validFrom && !validUntil) return "Sin restricción";
    
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    if (validFrom && validUntil) {
      return `${formatDate(validFrom)} - ${formatDate(validUntil)}`;
    } else if (validFrom) {
      return `Desde ${formatDate(validFrom)}`;
    } else if (validUntil) {
      return `Hasta ${formatDate(validUntil)}`;
    }
    
    return "Sin restricción";
  };

  const formatNights = (minNights?: number | null, maxNights?: number | null) => {
    if (!minNights && !maxNights) return "Sin límite";
    if (minNights && maxNights) return `${minNights}-${maxNights} noches`;
    if (minNights) return `Mín. ${minNights} noches`;
    if (maxNights) return `Máx. ${maxNights} noches`;
    return "Sin límite";
  };

  if (rates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay tarifas disponibles con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Habitación</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead>IVA (16%)</TableHead>
            <TableHead>ISH (4%)</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Días</TableHead>
            <TableHead>Noches</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{rate.room.roomNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {roomTypeLabels[rate.room.type]}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium">{rate.name}</div>
                  {rate.isDefault && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Por defecto
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary">
                  {rateTypeLabels[rate.type]}
                </Badge>
              </TableCell>
              
              <TableCell>
                ${typeof rate.subtotal === 'number' ? rate.subtotal.toFixed(2) : rate.subtotal}
              </TableCell>
              <TableCell>
                ${typeof rate.taxAmount === 'number' ? rate.taxAmount.toFixed(2) : rate.taxAmount}
              </TableCell>
              <TableCell>
                ${typeof rate.serviceFeeAmount === 'number' ? rate.serviceFeeAmount.toFixed(2) : rate.serviceFeeAmount}
              </TableCell>
              
              <TableCell className="font-medium">
                ${typeof rate.totalPrice === 'number' ? rate.totalPrice.toFixed(2) : rate.totalPrice}
              </TableCell>
              
              <TableCell className="text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateRange(rate.validFrom, rate.validUntil)}
                </div>
              </TableCell>
              
              <TableCell className="text-sm">
                {formatValidDays(rate.validDays)}
              </TableCell>
              
              <TableCell className="text-sm">
                {formatNights(rate.minNights, rate.maxNights)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1">
                  {rate.isActive ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="h-3 w-3" />
                      <span className="text-xs">Activa</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <X className="h-3 w-3" />
                      <span className="text-xs">Inactiva</span>
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(rate)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(rate.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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
