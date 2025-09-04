// Tipos TypeScript para el sistema de reportes de conceptos por turnos
// Archivo: lib/reports/types.ts

import { Currency, PaymentType, MovementType } from '@prisma/client';

export interface TurnReportConfig {
  // Filtros de fecha
  dateFrom: Date;
  dateTo: Date;
  
  // Filtros de turno
  turnos: number[]; // [1, 2, 3] o [] para todos
  
  // Filtros de moneda
  currencies: Currency[]; // ['MXN', 'USD'] o [] para todas
  
  // Filtros de tipo de pago
  paymentTypes: PaymentType[]; // ['CASH', 'CARD'] o [] para todos
  
  // Filtros de tipo de movimiento
  movementTypes: MovementType[]; // tipos específicos o [] para todos
  
  // Opciones de agrupación
  groupBy: 'turno' | 'date' | 'user' | 'currency' | 'paymentType';
  
  // Opciones de formato
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
  
  // Información del turno
  turno: {
    numero: number;
    nombre: string;
  } | null;
  
  // Información del usuario
  user: {
    id: number;
    name: string;
    lastName: string | null;
  } | null;
  
  // Información de la reserva/cliente (si aplica)
  booking: {
    id: number;
    guestName: string;
  } | null;
  
  // Información del cliente/customer
  customer: {
    id?: number;
    name: string;
    email?: string;
  } | null;
  
  // Desglose financiero
  subtotal: number;          // Monto antes de impuestos
  tax: number;              // IVA (16% del subtotal)
  serviceFee: number;       // Impuesto del 3%
  totalPaid: number;        // Total pagado (subtotal + tax + serviceFee)
  
  // Tipo de pago (si es pago)
  paymentType?: PaymentType;
  
  // Indicador de entrada/salida
  isIncome: boolean; // true para entradas, false para salidas
}

export interface TurnReportSummary {
  turno: number;
  turnoName: string;
  
  // Totales por moneda
  totals: {
    [key in Currency]: {
      income: number;    // Entradas
      expenses: number;  // Salidas  
      net: number;       // Neto (income - expenses)
    };
  };
  
  // Totales por tipo de pago
  paymentTypeTotals: {
    [key in PaymentType]: {
      [curr in Currency]: number;
    };
  };
  
  // Contadores
  totalMovements: number;
  totalPayments: number;
  totalRefunds: number;
}

export interface TurnReportData {
  config: TurnReportConfig;
  summary: TurnReportSummary[];
  movements: TurnReportMovement[];
  
  // Totales generales
  grandTotals: {
    [key in Currency]: {
      income: number;
      expenses: number;
      net: number;
    };
  };
  
  // Metadatos
  metadata: {
    generatedAt: Date;
    generatedBy: number; // userId
    totalRecords: number;
    dateRange: {
      from: Date;
      to: Date;
    };
  };
}

export interface ReportExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  template: 'detailed' | 'summary' | 'executive';
  includeCharts: boolean;
  includeSignatures: boolean;
}

// Tipos para configuración de PDF
export interface PDFReportConfig {
  title: string;
  subtitle?: string;
  headerInfo: {
    hotelName: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  footerInfo: {
    generatedBy: string;
    generatedAt: Date;
    pageNumbers: boolean;
  };
  styling: {
    primaryColor: string;
    fontSize: number;
    fontFamily: string;
  };
}

// Constantes para tipos de movimiento y sus características
export const MOVEMENT_CHARACTERISTICS: Record<MovementType, {
  isIncome: boolean;
  category: 'payment' | 'charge' | 'adjustment' | 'refund';
  displayName: string;
}> = {
  PAYMENT: { isIncome: true, category: 'payment', displayName: 'Pago General' },
  LODGING_PAYMENT: { isIncome: true, category: 'payment', displayName: 'Pago Hospedaje' },
  CASH_PAYMENT: { isIncome: true, category: 'payment', displayName: 'Pago Efectivo' },
  CARD_PAYMENT: { isIncome: true, category: 'payment', displayName: 'Pago Tarjeta' },
  EXTRA_CHARGE: { isIncome: true, category: 'charge', displayName: 'Cargo Extra' },
  SERVICE_CHARGE: { isIncome: true, category: 'charge', displayName: 'Cargo por Servicio' },
  EXTENSION: { isIncome: true, category: 'charge', displayName: 'Extensión' },
  REFUND: { isIncome: false, category: 'refund', displayName: 'Reembolso' },
  CANCELLATION: { isIncome: false, category: 'refund', displayName: 'Cancelación' },
  DISCOUNT: { isIncome: false, category: 'adjustment', displayName: 'Descuento' },
  OTHER: { isIncome: true, category: 'adjustment', displayName: 'Otro' },
};

// Configuraciones predefinidas de reportes
export const PREDEFINED_REPORT_CONFIGS: Record<string, Partial<TurnReportConfig>> = {
  daily_cash_flow: {
    groupBy: 'turno',
    paymentTypes: ['CASH', 'CARD'],
    includeDetails: true,
    showTotals: true,
  },
  shift_summary: {
    groupBy: 'turno',
    includeDetails: false,
    showTotals: true,
  },
  detailed_movements: {
    groupBy: 'date',
    includeDetails: true,
    showTotals: true,
  },
};
