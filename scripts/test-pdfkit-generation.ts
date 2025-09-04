// Script de prueba para el generador de PDF con PDFKit
// Archivo: scripts/test-pdfkit-generation.ts

import { generateTurnConceptsPDF, HotelInfo } from '../lib/reports/utils/pdf-generator';
import { TurnReportData } from '../lib/reports/types';
import { Currency, PaymentType, MovementType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

// Datos de prueba
const mockReportData: TurnReportData = {
  config: {
    dateFrom: new Date('2024-01-01'),
    dateTo: new Date('2024-01-31'),
    turnos: [1, 2, 3],
    currencies: [Currency.MXN, Currency.USD],
    paymentTypes: [PaymentType.CASH, PaymentType.CARD],
    movementTypes: [MovementType.PAYMENT, MovementType.LODGING_PAYMENT],
    groupBy: 'turno',
    includeDetails: true,
    showTotals: true,
  },
  summary: [
    {
      turno: 1,
      turnoName: 'Turno Matutino',
      totals: {
        [Currency.MXN]: {
          income: 15000,
          expenses: 3000,
          net: 12000,
        },
        [Currency.USD]: {
          income: 800,
          expenses: 100,
          net: 700,
        },
        [Currency.EUR]: {
          income: 0,
          expenses: 0,
          net: 0,
        },
      },
      paymentTypeTotals: {
        [PaymentType.CASH]: {
          [Currency.MXN]: 8000,
          [Currency.USD]: 400,
          [Currency.EUR]: 0,
        },
        [PaymentType.CARD]: {
          [Currency.MXN]: 7000,
          [Currency.USD]: 400,
          [Currency.EUR]: 0,
        },
        [PaymentType.TRANSFER]: {
          [Currency.MXN]: 0,
          [Currency.USD]: 0,
          [Currency.EUR]: 0,
        },
        [PaymentType.CHECK]: {
          [Currency.MXN]: 0,
          [Currency.USD]: 0,
          [Currency.EUR]: 0,
        },
        [PaymentType.OTHER]: {
          [Currency.MXN]: 0,
          [Currency.USD]: 0,
          [Currency.EUR]: 0,
        },
      },
      totalMovements: 25,
      totalPayments: 20,
      totalRefunds: 2,
    },
    {
      turno: 2,
      turnoName: 'Turno Vespertino',
      totals: {
        [Currency.MXN]: {
          income: 18000,
          expenses: 2500,
          net: 15500,
        },
        [Currency.USD]: {
          income: 950,
          expenses: 50,
          net: 900,
        },
        [Currency.EUR]: {
          income: 0,
          expenses: 0,
          net: 0,
        },
      },
      paymentTypeTotals: {
        [PaymentType.CASH]: {
          [Currency.MXN]: 9000,
          [Currency.USD]: 500,
          [Currency.EUR]: 0,
        },
        [PaymentType.CARD]: {
          [Currency.MXN]: 9000,
          [Currency.USD]: 450,
          [Currency.EUR]: 0,
        },
        [PaymentType.TRANSFER]: {
          [Currency.MXN]: 0,
          [Currency.USD]: 0,
          [Currency.EUR]: 0,
        },
        [PaymentType.CHECK]: {
          [Currency.MXN]: 0,
          [Currency.USD]: 0,
          [Currency.EUR]: 0,
        },
        [PaymentType.OTHER]: {
          [Currency.MXN]: 0,
          [Currency.USD]: 0,
          [Currency.EUR]: 0,
        },
      },
      totalMovements: 30,
      totalPayments: 28,
      totalRefunds: 1,
    },
  ],
  movements: [
    {
      id: 1,
      type: MovementType.LODGING_PAYMENT,
      amount: 2500,
      total: 2500,
      currency: Currency.MXN,
      concept: 'Pago de habitación estándar',
      reference: 'REF-001',
      date: new Date('2024-01-15T10:30:00'),
      turno: {
        numero: 1,
        nombre: 'Turno Matutino',
      },
      user: {
        id: 1,
        name: 'Juan',
        lastName: 'Pérez',
      },
      booking: {
        id: 101,
        guestName: 'María García',
      },
      paymentType: PaymentType.CASH,
      isIncome: true,
    },
    {
      id: 2,
      type: MovementType.PAYMENT,
      amount: 500,
      total: 500,
      currency: Currency.USD,
      concept: 'Pago de servicios adicionales',
      reference: 'REF-002',
      date: new Date('2024-01-15T14:20:00'),
      turno: {
        numero: 2,
        nombre: 'Turno Vespertino',
      },
      user: {
        id: 2,
        name: 'Ana',
        lastName: 'López',
      },
      booking: {
        id: 102,
        guestName: 'Carlos Rodríguez',
      },
      paymentType: PaymentType.CARD,
      isIncome: true,
    },
    {
      id: 3,
      type: MovementType.REFUND,
      amount: -200,
      total: -200,
      currency: Currency.MXN,
      concept: 'Reembolso por cancelación',
      reference: 'REF-003',
      date: new Date('2024-01-16T09:15:00'),
      turno: {
        numero: 1,
        nombre: 'Turno Matutino',
      },
      user: {
        id: 1,
        name: 'Juan',
        lastName: 'Pérez',
      },
      booking: {
        id: 103,
        guestName: 'Luis Mendoza',
      },
      isIncome: false,
    },
  ],
  grandTotals: {
    [Currency.MXN]: {
      income: 33000,
      expenses: 5500,
      net: 27500,
    },
    [Currency.USD]: {
      income: 1750,
      expenses: 150,
      net: 1600,
    },
    [Currency.EUR]: {
      income: 0,
      expenses: 0,
      net: 0,
    },
  },
  metadata: {
    generatedAt: new Date(),
    generatedBy: 1,
    totalRecords: 55,
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    },
  },
};

const mockHotelInfo: HotelInfo = {
  name: 'Hotel Oasis Paradise',
  address: 'Av. Costera Miguel Alemán 123, Acapulco, Guerrero',
  phone: '+52 744 123 4567',
  email: 'info@hoteloasisparadise.com',
};

async function testPDFGeneration() {
  try {
    console.log('🚀 Iniciando prueba de generación de PDF con PDFKit...');
    
    const pdfBuffer = await generateTurnConceptsPDF(
      mockReportData,
      mockHotelInfo,
      'Juan Pérez - Administrador'
    );
    
    // Guardar el PDF en un archivo de prueba
    const outputPath = path.join(__dirname, '..', 'temp', 'test-turn-concepts-report.pdf');
    
    // Crear directorio temp si no existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Escribir el archivo PDF
    await fs.writeFile(outputPath, pdfBuffer);
    
    console.log('✅ PDF generado exitosamente!');
    console.log(`📄 Archivo guardado en: ${outputPath}`);
    console.log(`📊 Tamaño del archivo: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Estadísticas del reporte
    console.log('\n📈 Estadísticas del reporte:');
    console.log(`• Total de turnos: ${mockReportData.summary.length}`);
    console.log(`• Total de movimientos: ${mockReportData.movements.length}`);
    console.log(`• Período: ${mockReportData.metadata.dateRange.from.toLocaleDateString()} - ${mockReportData.metadata.dateRange.to.toLocaleDateString()}`);
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
if (require.main === module) {
  testPDFGeneration()
    .then(() => {
      console.log('\n🎉 Prueba completada con éxito!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la prueba:', error);
      process.exit(1);
    });
}

export { testPDFGeneration };
