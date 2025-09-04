// Generador de reportes de conceptos por turnos
// Archivo: lib/reports/generators/turn-concepts-report.ts

import { MovementType, Currency, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface TurnReportConfig {
  dateFrom: Date;
  dateTo: Date;
  turnos: number[]; // [1, 2, 3] o [] para todos
  currencies: Currency[];
  paymentTypes: PaymentType[];
  movementTypes: MovementType[];
  groupBy: "turno" | "date" | "user" | "currency" | "paymentType";
  includeDetails: boolean;
  showTotals: boolean;
}

export interface TurnReportMovement {
  id: number;
  type: MovementType;
  amount: number;
  total: number;
  currency: Currency;
  concept: string | null;
  reference: string | null;
  date: Date;
  turno: {
    numero: number;
    nombre: string;
  } | null;
  user: {
    id: number;
    name: string;
    lastName: string | null;
  } | null;
  booking: {
    id: number;
    guestName: string;
  } | null;
  customer: {
    id: number;
    name: string;
    email: string;
  } | null;
  subtotal: number;
  tax: number;     // IVA 16%
  serviceFee: number;  // Impuesto 3%
  totalPaid: number;
  paymentType?: PaymentType;
  isIncome: boolean;
}

export interface TurnReportSummary {
  turno: number;
  turnoName: string;
  totals: Record<
    Currency,
    {
      income: number;
      expenses: number;
      net: number;
    }
  >;
  paymentTypeTotals: Record<PaymentType, Record<Currency, number>>;
  totalMovements: number;
  totalPayments: number;
  totalRefunds: number;
}

export interface TurnReportData {
  config: TurnReportConfig;
  summary: TurnReportSummary[];
  movements: TurnReportMovement[];
  grandTotals: Record<
    Currency,
    {
      income: number;
      expenses: number;
      net: number;
    }
  >;
  metadata: {
    generatedAt: Date;
    generatedBy: number;
    totalRecords: number;
    dateRange: {
      from: Date;
      to: Date;
    };
  };
}

// Constantes para características de tipos de movimiento
const MOVEMENT_CHARACTERISTICS: Record<
  MovementType,
  {
    isIncome: boolean;
    category: "payment" | "charge" | "adjustment" | "refund";
    displayName: string;
  }
> = {
  PAYMENT: { isIncome: true, category: "payment", displayName: "Pago General" },
  LODGING_PAYMENT: { isIncome: true, category: "payment", displayName: "Pago Hospedaje" },
  CASH_PAYMENT: { isIncome: true, category: "payment", displayName: "Pago Efectivo" },
  CARD_PAYMENT: { isIncome: true, category: "payment", displayName: "Pago Tarjeta" },
  EXTRA_CHARGE: { isIncome: true, category: "charge", displayName: "Cargo Extra" },
  SERVICE_CHARGE: { isIncome: true, category: "charge", displayName: "Cargo Servicio" },
  EXTENSION: { isIncome: true, category: "charge", displayName: "Extensión" },
  DISCOUNT: { isIncome: false, category: "adjustment", displayName: "Descuento" },
  REFUND: { isIncome: false, category: "refund", displayName: "Reembolso" },
  CANCELLATION: { isIncome: false, category: "adjustment", displayName: "Cancelación" },
  OTHER: { isIncome: true, category: "payment", displayName: "Otro" },
};

/**
 * Genera reporte de conceptos por turnos
 */
export async function generateTurnConceptsReport(
  config: TurnReportConfig,
  generatedBy: number
): Promise<TurnReportData> {
  try {
    // 1. Obtener movimientos de BookingMovement
    const bookingMovements = await prisma.bookingMovement.findMany({
      where: {
        createdAt: {
          gte: config.dateFrom,
          lte: config.dateTo,
        },
        ...(config.turnos.length > 0 && {
          turno: {
            numero: {
              in: config.turnos,
            },
          },
        }),
        ...(config.movementTypes.length > 0 && {
          type: {
            in: config.movementTypes,
          },
        }),
      },
      include: {
        turno: true,
        user: true,
        booking: {
          include: {
            guest: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 2. Obtener pagos del modelo Payment
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: config.dateFrom,
          lte: config.dateTo,
        },
      },
      include: {
        booking: {
          include: {
            guest: true,
          },
        },
        turno: true,
        user: true,
      },
      orderBy: {
        paymentDate: "asc",
      },
    });

    // 3. Transformar datos a formato común
    const movements: TurnReportMovement[] = [
      // Movimientos de BookingMovement
      ...bookingMovements.map((movement) => {
        const amount = Number(movement.amount || 0);
        const subtotal = Number(movement.subtotal || amount * 0.8276); // Si no está en BD, calcular como 82.76% del total
        const tax = Number(movement.iva || subtotal * 0.16); // IVA 16%
        const serviceFee = Number(movement.tax3 || subtotal * 0.03); // Impuesto 3%
        const totalPaid = Number(movement.total || amount);

        return {
          id: movement.id,
          type: movement.type,
          amount: amount,
          total: totalPaid,
          currency: movement.currency || "MXN" as Currency,
          concept: movement.concept,
          reference: movement.reference,
          date: movement.createdAt,
          turno: movement.turno
            ? {
                numero: movement.turno.numero,
                nombre: movement.turno.nombre,
              }
            : null,
          user: movement.user
            ? {
                id: movement.user.id,
                name: movement.user.name,
                lastName: movement.user.lastName,
              }
            : null,
          booking: movement.booking
            ? {
                id: movement.booking.id,
                guestName: `${movement.booking.guest.firstName} ${movement.booking.guest.lastName}`,
              }
            : null,
          customer: movement.booking
            ? {
                id: movement.booking.guest.id,
                name: `${movement.booking.guest.firstName} ${movement.booking.guest.lastName}`,
                email: movement.booking.guest.email,
              }
            : null,
          subtotal: subtotal,
          tax: tax,
          serviceFee: serviceFee,
          totalPaid: totalPaid,
          paymentType: movement.paymentType || "OTHER" as PaymentType,
          isIncome: MOVEMENT_CHARACTERISTICS[movement.type]?.isIncome ?? true,
        };
      }),

      // Pagos del modelo Payment
      ...payments.map((payment) => {
        const amount = Number(payment.amount);
        const subtotal = amount * 0.8276; // Calcular como 82.76% del total
        const tax = subtotal * 0.16; // IVA 16%
        const serviceFee = subtotal * 0.03; // Impuesto 3%

        return {
          id: payment.id + 100000, // Offset para evitar conflicto de IDs
          type: "PAYMENT" as MovementType,
          amount: amount,
          total: amount,
          currency: payment.currency || "MXN" as Currency,
          concept: payment.description || `Pago ${payment.paymentMethod}`,
          reference: payment.reference || payment.id.toString(),
          date: new Date(payment.paymentDate),
          turno: payment.turno
            ? {
                numero: payment.turno.numero,
                nombre: payment.turno.nombre,
              }
            : null,
          user: payment.user
            ? {
                id: payment.user.id,
                name: payment.user.name,
                lastName: payment.user.lastName,
              }
            : null,
          booking: {
            id: payment.booking.id,
            guestName: `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`,
          },
          customer: {
            id: payment.booking.guest.id,
            name: `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`,
            email: payment.booking.guest.email,
          },
          subtotal: subtotal,
          tax: tax,
          serviceFee: serviceFee,
          totalPaid: amount,
          paymentType: payment.paymentType || determinePaymentType(payment.paymentMethod),
          isIncome: true,
        };
      }),
    ];

    // 4. Filtrar por configuración
    const filteredMovements = movements.filter((movement) => {
      if (
        config.currencies.length > 0 &&
        !config.currencies.includes(movement.currency)
      ) {
        return false;
      }
      if (
        config.paymentTypes.length > 0 &&
        movement.paymentType &&
        !config.paymentTypes.includes(movement.paymentType)
      ) {
        return false;
      }
      return true;
    });

    // 5. Generar resúmenes por turno
    const summary = generateTurnSummary(filteredMovements);

    // 6. Calcular totales generales
    const grandTotals = calculateGrandTotals(filteredMovements);

    return {
      config,
      summary,
      movements: filteredMovements,
      grandTotals,
      metadata: {
        generatedAt: new Date(),
        generatedBy,
        totalRecords: filteredMovements.length,
        dateRange: {
          from: config.dateFrom,
          to: config.dateTo,
        },
      },
    };
  } catch (error) {
    console.error("Error generando reporte de conceptos por turnos:", error);
    throw new Error("No se pudo generar el reporte");
  }
}

/**
 * Determina el tipo de pago basado en el método de pago
 */
function determinePaymentType(paymentMethod: string): PaymentType {
  const method = paymentMethod.toLowerCase();
  if (method.includes("efectivo") || method.includes("cash")) {
    return "CASH";
  }
  if (
    method.includes("tarjeta") ||
    method.includes("card") ||
    method.includes("visa") ||
    method.includes("mastercard")
  ) {
    return "CARD";
  }
  if (method.includes("transferencia") || method.includes("transfer")) {
    return "TRANSFER";
  }
  if (method.includes("cheque") || method.includes("check")) {
    return "CHECK";
  }
  return "OTHER";
}

/**
 * Genera resumen por turno
 */
function generateTurnSummary(
  movements: TurnReportMovement[]
): TurnReportSummary[] {
  const turnoGroups = new Map<number, TurnReportMovement[]>();

  // Agrupar por turno
  movements.forEach((movement) => {
    const turnoNum = movement.turno?.numero ?? 0; // 0 para movimientos sin turno
    if (!turnoGroups.has(turnoNum)) {
      turnoGroups.set(turnoNum, []);
    }
    turnoGroups.get(turnoNum)!.push(movement);
  });

  // Generar resumen para cada turno
  return Array.from(turnoGroups.entries()).map(([turnoNum, turnoMovements]) => {
    const turnoName = turnoMovements[0]?.turno?.nombre ?? "Sin Turno";

    // Calcular totales por moneda
    const totals: Record<
      Currency,
      { income: number; expenses: number; net: number }
    > = {
      MXN: { income: 0, expenses: 0, net: 0 },
      USD: { income: 0, expenses: 0, net: 0 },
      EUR: { income: 0, expenses: 0, net: 0 },
    };

    // Calcular totales por tipo de pago
    const paymentTypeTotals: Record<PaymentType, Record<Currency, number>> = {
      CASH: { MXN: 0, USD: 0, EUR: 0 },
      CARD: { MXN: 0, USD: 0, EUR: 0 },
      TRANSFER: { MXN: 0, USD: 0, EUR: 0 },
      CHECK: { MXN: 0, USD: 0, EUR: 0 },
      OTHER: { MXN: 0, USD: 0, EUR: 0 },
    };

    let totalPayments = 0;
    let totalRefunds = 0;

    turnoMovements.forEach((movement) => {
      const currency = movement.currency;
      const amount = movement.total;

      if (movement.isIncome) {
        totals[currency].income += amount;
      } else {
        totals[currency].expenses += amount;
      }

      // Contabilizar por tipo de pago
      if (movement.paymentType) {
        paymentTypeTotals[movement.paymentType][currency] += amount;
      }

      // Contadores
      if (movement.type === "PAYMENT") {
        totalPayments++;
      } else if (
        movement.type === "REFUND" ||
        movement.type === "CANCELLATION"
      ) {
        totalRefunds++;
      }
    });

    // Calcular neto
    Object.keys(totals).forEach((curr) => {
      const currency = curr as Currency;
      totals[currency].net =
        totals[currency].income - totals[currency].expenses;
    });

    return {
      turno: turnoNum,
      turnoName,
      totals,
      paymentTypeTotals,
      totalMovements: turnoMovements.length,
      totalPayments,
      totalRefunds,
    };
  });
}

/**
 * Calcula totales generales
 */
function calculateGrandTotals(
  movements: TurnReportMovement[]
): Record<Currency, { income: number; expenses: number; net: number }> {
  const grandTotals: Record<
    Currency,
    { income: number; expenses: number; net: number }
  > = {
    MXN: { income: 0, expenses: 0, net: 0 },
    USD: { income: 0, expenses: 0, net: 0 },
    EUR: { income: 0, expenses: 0, net: 0 },
  };

  movements.forEach((movement) => {
    const currency = movement.currency;
    const amount = movement.total;

    if (movement.isIncome) {
      grandTotals[currency].income += amount;
    } else {
      grandTotals[currency].expenses += amount;
    }
  });

  // Calcular neto
  Object.keys(grandTotals).forEach((curr) => {
    const currency = curr as Currency;
    grandTotals[currency].net =
      grandTotals[currency].income - grandTotals[currency].expenses;
  });

  return grandTotals;
}
