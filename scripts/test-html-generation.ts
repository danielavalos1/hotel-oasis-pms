/**
 * Script de prueba para el generador HTML de reportes
 */

import { generateTurnConceptsHTML, HotelInfo } from '../lib/reports/utils/pdf-generator-simple';
import { TurnReportData } from '../lib/reports/types';
import { Currency, MovementType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

async function testHTMLGeneration() {
  console.log('🧪 Iniciando prueba del generador HTML...');

  // Datos de prueba
  const mockReportData: TurnReportData = {
    config: {
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-01-02'),
      turnos: [1, 2, 3],
      currencies: ['MXN' as Currency],
      paymentTypes: [],
      movementTypes: [],
      groupBy: 'turno',
      includeDetails: true,
      showTotals: true,
    },
    summary: [
      {
        turno: 1,
        turnoName: 'Turno Matutino',
        totals: {
          MXN: { income: 5000, expenses: 1500, net: 3500 },
          USD: { income: 0, expenses: 0, net: 0 },
          EUR: { income: 0, expenses: 0, net: 0 },
        },
        paymentTypeTotals: {} as any,
        totalMovements: 5,
        totalPayments: 3,
        totalRefunds: 1,
      },
      {
        turno: 2,
        turnoName: 'Turno Vespertino',
        totals: {
          MXN: { income: 7500, expenses: 2000, net: 5500 },
          USD: { income: 0, expenses: 0, net: 0 },
          EUR: { income: 0, expenses: 0, net: 0 },
        },
        paymentTypeTotals: {} as any,
        totalMovements: 8,
        totalPayments: 6,
        totalRefunds: 0,
      },
    ],
    movements: [
      {
        id: 1,
        type: 'CHECKIN_PAYMENT' as MovementType,
        amount: 2500,
        total: 2500,
        currency: 'MXN' as Currency,
        concept: 'Pago de hospedaje',
        reference: 'REF001',
        date: new Date('2024-01-01T10:00:00Z'),
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
          id: 1,
          guestName: 'Cliente Test',
        },
        customer: {
          id: 1,
          name: 'María González',
          email: 'maria@example.com',
        },
        subtotal: 2155.17,
        tax: 344.83,   // 16% del subtotal
        serviceFee: 64.66,  // 3% del subtotal
        totalPaid: 2500,
        isIncome: true,
      },
      {
        id: 2,
        type: 'ROOM_SERVICE' as MovementType,
        amount: 500,
        total: 500,
        currency: 'MXN' as Currency,
        concept: 'Servicio a habitación',
        reference: 'REF002',
        date: new Date('2024-01-01T15:30:00Z'),
        turno: {
          numero: 2,
          nombre: 'Turno Vespertino',
        },
        user: {
          id: 2,
          name: 'María',
          lastName: 'García',
        },
        booking: {
          id: 2,
          guestName: 'Cliente Test 2',
        },
        customer: {
          id: 2,
          name: 'Carlos Rodríguez',
          email: 'carlos@example.com',
        },
        subtotal: 431.03,
        tax: 68.97,    // 16% del subtotal
        serviceFee: 12.93,   // 3% del subtotal
        totalPaid: 500,
        isIncome: true,
      },
    ],
    grandTotals: {
      MXN: { income: 12500, expenses: 3500, net: 9000 },
      USD: { income: 0, expenses: 0, net: 0 },
      EUR: { income: 0, expenses: 0, net: 0 },
    },
    metadata: {
      generatedAt: new Date(),
      generatedBy: 1,
      totalRecords: 2,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      },
    },
  };

  const hotelInfo: HotelInfo = {
    name: 'Hotel Oasis PMS - Prueba',
    address: 'Calle Ficticia 123, Ciudad Test',
    phone: '+52 123 456 7890',
    email: 'test@hoteloasis.com',
    website: 'www.hoteloasis.com',
  };

  try {
    // Generar HTML
    const html = generateTurnConceptsHTML(
      mockReportData,
      hotelInfo,
      'Usuario Test'
    );

    // Guardar HTML en archivo temporal
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const filename = `test-turn-concepts-report-${Date.now()}.html`;
    const filepath = path.join(tempDir, filename);
    
    await fs.writeFile(filepath, html, 'utf-8');

    console.log('✅ HTML generado exitosamente! 📄');
    console.log(`📁 Archivo guardado en: ${filepath}`);
    console.log(`📊 Tamaño del archivo: ${(Buffer.byteLength(html, 'utf-8') / 1024).toFixed(2)} KB`);
    console.log('\n🎯 Puedes abrir el archivo HTML en tu navegador para ver el reporte');

    return true;

  } catch (error) {
    console.error('❌ Error generando HTML del reporte:', error);
    return false;
  }
}

// Ejecutar la prueba
testHTMLGeneration()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Prueba completada exitosamente!');
    } else {
      console.log('\n💥 La prueba falló');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Error ejecutando la prueba:', error);
    process.exit(1);
  });
