import { prisma } from "@/lib/prisma";
import { RoomRate, Prisma, RateType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Función para convertir Decimals de Prisma a números
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  // Verificar si es un objeto Decimal de Prisma (tiene propiedades s, e, d)
  if (typeof obj === 'object' && obj !== null && 's' in obj && 'e' in obj && 'd' in obj) {
    return parseFloat(obj.toString());
  }

  // Verificar por constructor name como respaldo
  if (typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Decimal') {
    return parseFloat(obj.toString());
  }

  // Verificar si es un array
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToNumbers);
  }

  // Si es un objeto regular, procesar recursivamente
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDecimalsToNumbers(value);
    }
    return converted;
  }

  return obj;
}

// Tipos para el servicio
export interface CreateRateInput {
  roomId: number;
  name: string;
  type: RateType;
  subtotal: number;
  isActive?: boolean;
  isDefault?: boolean;
  validFrom?: Date;
  validUntil?: Date;
  validDays?: string[];
  minNights?: number | null;
  maxNights?: number | null;
  createdBy: string;
}

export interface UpdateRateInput extends Partial<CreateRateInput> {
  id: number;
}

export interface RateFilters {
  roomId?: number;
  roomType?: string;
  rateType?: RateType;
  isActive?: boolean;
  validAt?: Date;
}

// Tipo para las tarifas con información de habitación
export type RoomRateWithRoom = Prisma.RoomRateGetPayload<{
  include: {
    room: {
      select: {
        id: true;
        roomNumber: true;
        type: true;
      };
    };
  };
}>;

export const ratesService = {
  /**
   * Crear una nueva tarifa
   */
  async createRate(input: CreateRateInput): Promise<RoomRateWithRoom> {
    // Calcular precios automáticamente
    const subtotal = new Decimal(input.subtotal);
    const taxRate = new Decimal(0.16); // 16% IVA
    const serviceFeeRate = new Decimal(0.04); // 4% ISH
    
    const taxAmount = subtotal.mul(taxRate);
    const serviceFeeAmount = subtotal.mul(serviceFeeRate);
    const totalPrice = subtotal.add(taxAmount).add(serviceFeeAmount);
    const basePrice = totalPrice; // El precio base es el total con impuestos

    return await prisma.$transaction(async (tx) => {
      // Si esta tarifa será la default, quitar el default de las otras tarifas de la misma habitación
      if (input.isDefault) {
        await tx.roomRate.updateMany({
          where: {
            roomId: input.roomId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Crear la nueva tarifa
      return await tx.roomRate.create({
        data: {
          roomId: input.roomId,
          name: input.name,
          type: input.type,
          basePrice,
          taxRate,
          serviceFeeRate,
          subtotal,
          taxAmount,
          serviceFeeAmount,
          totalPrice,
          isActive: input.isActive ?? true,
          isDefault: input.isDefault ?? false,
          validFrom: input.validFrom,
          validUntil: input.validUntil,
          validDays: input.validDays || [],
          minNights: input.minNights,
          maxNights: input.maxNights,
          createdBy: input.createdBy,
        },
        include: {
          room: {
            select: {
              id: true,
              roomNumber: true,
              type: true,
            },
          },
        },
      });
    });
  },

  /**
   * Obtener una tarifa por ID
   */
  async getRate(id: number): Promise<RoomRateWithRoom | null> {
    return await prisma.roomRate.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
    });
  },

  /**
   * Obtener todas las tarifas con filtros opcionales
   */
  async getAllRates(filters: RateFilters = {}): Promise<RoomRateWithRoom[]> {
    const where: Prisma.RoomRateWhereInput = {};

    // Aplicar filtros
    if (filters.roomId) {
      where.roomId = filters.roomId;
    }

    if (filters.rateType) {
      where.type = filters.rateType;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.roomType) {
      where.room = {
        type: filters.roomType as any,
      };
    }

    // Filtro por fecha válida
    if (filters.validAt) {
      where.OR = [
        {
          AND: [
            { validFrom: { lte: filters.validAt } },
            { validUntil: { gte: filters.validAt } },
          ],
        },
        {
          AND: [
            { validFrom: null },
            { validUntil: null },
          ],
        },
        {
          AND: [
            { validFrom: { lte: filters.validAt } },
            { validUntil: null },
          ],
        },
        {
          AND: [
            { validFrom: null },
            { validUntil: { gte: filters.validAt } },
          ],
        },
      ];
    }

    const rates = await prisma.roomRate.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
      orderBy: [
        { room: { roomNumber: 'asc' } },
        { isDefault: 'desc' },
        { type: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Convertir Decimals a números antes de devolver
    return rates.map(rate => convertDecimalsToNumbers(rate)) as RoomRateWithRoom[];
  },

  /**
   * Obtener tarifas activas para una habitación específica
   */
  async getRatesForRoom(roomId: number): Promise<RoomRateWithRoom[]> {
    return await prisma.roomRate.findMany({
      where: {
        roomId,
        isActive: true,
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { type: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },

  /**
   * Obtener la tarifa por defecto para una habitación
   */
  async getDefaultRateForRoom(roomId: number): Promise<RoomRateWithRoom | null> {
    return await prisma.roomRate.findFirst({
      where: {
        roomId,
        isActive: true,
        isDefault: true,
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
    });
  },

  /**
   * Actualizar una tarifa
   */
  async updateRate(input: UpdateRateInput): Promise<RoomRateWithRoom> {
    const { id, ...updateData } = input;

    return await prisma.$transaction(async (tx) => {
      // Obtener la tarifa actual
      const currentRate = await tx.roomRate.findUnique({
        where: { id },
      });

      if (!currentRate) {
        throw new Error("Rate not found");
      }

      // Recalcular precios si se cambió el subtotal
      let priceCalculations = {};
      if (updateData.subtotal !== undefined) {
        const subtotal = new Decimal(updateData.subtotal);
        const taxRate = new Decimal(0.16); // 16% IVA
        const serviceFeeRate = new Decimal(0.04); // 4% ISH
        
        const taxAmount = subtotal.mul(taxRate);
        const serviceFeeAmount = subtotal.mul(serviceFeeRate);
        const totalPrice = subtotal.add(taxAmount).add(serviceFeeAmount);
        const basePrice = totalPrice;

        priceCalculations = {
          basePrice,
          subtotal,
          taxAmount,
          serviceFeeAmount,
          totalPrice,
        };
      }

      // Si esta tarifa será la default, quitar el default de las otras tarifas de la misma habitación
      if (updateData.isDefault) {
        await tx.roomRate.updateMany({
          where: {
            roomId: updateData.roomId || currentRate.roomId,
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Actualizar la tarifa
      return await tx.roomRate.update({
        where: { id },
        data: {
          ...updateData,
          ...priceCalculations,
        },
        include: {
          room: {
            select: {
              id: true,
              roomNumber: true,
              type: true,
            },
          },
        },
      });
    });
  },

  /**
   * Eliminar una tarifa
   */
  async deleteRate(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Verificar que la tarifa existe
      const rate = await tx.roomRate.findUnique({
        where: { id },
      });

      if (!rate) {
        throw new Error("Rate not found");
      }

      // Verificar que no hay reservas usando esta tarifa
      // (Esto dependerá de cómo implementes la relación entre BookingRoom y RoomRate)
      const bookingsUsingRate = await tx.bookingRoom.findMany({
        where: {
          roomId: rate.roomId,
          // Aquí podrías agregar una verificación más específica si tienes un campo rateId
        },
      });

      if (bookingsUsingRate.length > 0) {
        throw new Error("Cannot delete rate: it is being used by existing bookings");
      }

      // Eliminar la tarifa
      await tx.roomRate.delete({
        where: { id },
      });

      // Si era la tarifa por defecto, asignar otra como default
      if (rate.isDefault) {
        const remainingRates = await tx.roomRate.findMany({
          where: {
            roomId: rate.roomId,
            isActive: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        if (remainingRates.length > 0) {
          await tx.roomRate.update({
            where: { id: remainingRates[0].id },
            data: { isDefault: true },
          });
        }
      }
    });
  },

  /**
   * Obtener tarifas para reportes financieros
   */
  async getRatesForReports(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    roomType?: string;
    rateType?: RateType;
  } = {}): Promise<{
    rates: RoomRateWithRoom[];
    totalRates: number;
    averagePrices: {
      subtotal: number;
      totalPrice: number;
    };
    ratesByType: Record<RateType, number>;
  }> {
    const where: Prisma.RoomRateWhereInput = {
      isActive: true,
    };

    // Aplicar filtros de fecha
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    if (filters.roomType) {
      where.room = {
        type: filters.roomType as any,
      };
    }

    if (filters.rateType) {
      where.type = filters.rateType;
    }

    const rates = await prisma.roomRate.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
      orderBy: [
        { room: { roomNumber: 'asc' } },
        { type: 'asc' },
      ],
    });

    // Calcular estadísticas
    const totalRates = rates.length;
    const subtotalSum = rates.reduce((sum, rate) => sum + Number(rate.subtotal), 0);
    const totalPriceSum = rates.reduce((sum, rate) => sum + Number(rate.totalPrice), 0);

    const averagePrices = {
      subtotal: totalRates > 0 ? subtotalSum / totalRates : 0,
      totalPrice: totalRates > 0 ? totalPriceSum / totalRates : 0,
    };

    // Contar por tipo de tarifa
    const ratesByType = rates.reduce((acc, rate) => {
      acc[rate.type] = (acc[rate.type] || 0) + 1;
      return acc;
    }, {} as Record<RateType, number>);

    return {
      rates,
      totalRates,
      averagePrices,
      ratesByType,
    };
  },

  /**
   * Buscar la mejor tarifa para una habitación en una fecha específica
   */
  async getBestRateForRoomAndDate(
    roomId: number,
    date: Date,
    dayOfWeek: number
  ): Promise<RoomRateWithRoom | null> {
    const rates = await prisma.roomRate.findMany({
      where: {
        roomId,
        isActive: true,
        OR: [
          {
            AND: [
              { validFrom: { lte: date } },
              { validUntil: { gte: date } },
            ],
          },
          {
            AND: [
              { validFrom: null },
              { validUntil: null },
            ],
          },
        ],
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
      orderBy: [
        { type: 'desc' }, // SPECIAL > SEASONAL > WEEKEND > BASE
        { totalPrice: 'desc' }, // Precio más alto primero
      ],
    });

    // Filtrar por día de la semana válido
    const validRates = rates.filter(rate => {
      if (rate.validDays.length === 0) return true;
      return rate.validDays.includes(dayOfWeek.toString());
    });

    return validRates[0] || null;
  },

  /**
   * Activar/desactivar una tarifa
   */
  async toggleRateStatus(id: number): Promise<RoomRateWithRoom> {
    const rate = await prisma.roomRate.findUnique({
      where: { id },
    });

    if (!rate) {
      throw new Error("Rate not found");
    }

    return await prisma.roomRate.update({
      where: { id },
      data: {
        isActive: !rate.isActive,
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
          },
        },
      },
    });
  },
};
