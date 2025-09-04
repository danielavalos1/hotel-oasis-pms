// Script para probar el generador de reportes con datos reales de la base de datos
// Archivo: scripts/test-real-report.ts

import { generateTurnConceptsReport, TurnReportConfig } from '@/lib/reports/generators/turn-concepts-report';
import { generateTurnConceptsPDFFromHTML, HotelInfo } from '@/lib/reports/utils/pdf-generator-simple';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function testRealReport() {
  console.log('🧪 Iniciando prueba del reporte con datos reales...');

  try {
    // Configuración del reporte
    const config: TurnReportConfig = {
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-12-31'),
      turnos: [], // Todos los turnos
      currencies: ['MXN'],
      paymentTypes: [],
      movementTypes: [],
      groupBy: 'turno',
      includeDetails: true,
      showTotals: true,
    };

    // Generar reporte con datos reales
    const reportData = await generateTurnConceptsReport(config, 1);

    console.log('📊 Datos del reporte generados:');
    console.log(`- Movimientos encontrados: ${reportData.movements.length}`);
    console.log(`- Período: ${reportData.metadata.dateRange.from} - ${reportData.metadata.dateRange.to}`);
    console.log(`- Generado por: ${reportData.metadata.generatedBy}`);

    if (reportData.movements.length > 0) {
      console.log('\n💰 Primeros 3 movimientos:');
      reportData.movements.slice(0, 3).forEach((movement, index) => {
        console.log(`${index + 1}. ${movement.concept} - $${movement.totalPaid} ${movement.currency}`);
        console.log(`   Customer: ${movement.customer?.name || 'N/A'}`);
        console.log(`   Subtotal: $${movement.subtotal}, IVA: $${movement.tax}, Serv: $${movement.serviceFee}`);
        console.log(`   Turno: ${movement.turno?.nombre || 'N/A'}, Usuario: ${movement.user?.name || 'N/A'}`);
        console.log('');
      });
    }

    // Información del hotel
    const hotelInfo: HotelInfo = {
      name: 'Hotel Oasis PMS',
      address: 'Dirección del Hotel',
      phone: '+52 123 456 7890',
      email: 'info@hoteloasis.com',
    };

    // Generar HTML
    const { html, error } = await generateTurnConceptsPDFFromHTML(
      reportData,
      hotelInfo,
      'Usuario Sistema'
    );

    if (error) {
      console.error('❌ Error generando HTML:', error);
      return;
    }

    // Guardar archivo
    const timestamp = Date.now();
    const filename = `real-turn-concepts-report-${timestamp}.html`;
    const filepath = join(process.cwd(), 'temp', filename);

    writeFileSync(filepath, html);

    const fileSizeKB = Buffer.byteLength(html, 'utf8') / 1024;

    console.log('\n✅ HTML generado exitosamente! 📄');
    console.log(`📁 Archivo guardado en: ${filepath}`);
    console.log(`📊 Tamaño del archivo: ${fileSizeKB.toFixed(2)} KB`);
    console.log('\n🎯 Puedes abrir el archivo HTML en tu navegador para ver el reporte');
    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar la prueba
testRealReport().finally(() => {
  process.exit(0);
});
