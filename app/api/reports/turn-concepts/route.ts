// API Route para generar reportes de conceptos por turnos
// Archivo: app/api/reports/turn-concepts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateTurnConceptsReport, TurnReportConfig } from '@/lib/reports/generators/turn-concepts-report';
import { generateTurnConceptsHTML, generateTurnConceptsPDFFromHTML, HotelInfo } from '@/lib/reports/utils/pdf-generator-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const {
      dateFrom,
      dateTo,
      turnos = [],
      currencies = ['MXN'],
      paymentTypes = [],
      movementTypes = [],
      groupBy = 'turno',
      includeDetails = true,
      showTotals = true,
      format = 'PDF',
      generatedBy = 1, // TODO: Obtener del contexto de autenticación
    } = body;

    // Validar fechas
    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Las fechas son requeridas' },
        { status: 400 }
      );
    }

    const config: TurnReportConfig = {
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      turnos,
      currencies,
      paymentTypes,
      movementTypes,
      groupBy,
      includeDetails,
      showTotals,
    };

    // Generar reporte de datos
    const reportData = await generateTurnConceptsReport(config, generatedBy);

    // Si solo se necesitan los datos JSON
    if (format === 'JSON') {
      return NextResponse.json({
        success: true,
        data: reportData,
      });
    }

    // Información del hotel (debería venir de configuración)
    const hotelInfo: HotelInfo = {
      name: 'Hotel Oasis PMS',
      address: 'Dirección del Hotel',
      phone: '+52 123 456 7890',
      email: 'info@hoteloasis.com',
    };

    // Generar PDF/HTML
    if (format === 'PDF') {
      // TODO: Obtener nombre del usuario desde la sesión
      const generatedByName = 'Usuario Sistema'; 

      // Generar HTML del reporte
      const { html, error } = await generateTurnConceptsPDFFromHTML(
        reportData,
        hotelInfo,
        generatedByName
      );

      if (error) {
        return NextResponse.json(
          { error },
          { status: 500 }
        );
      }

      // Generar nombre de archivo
      const startDate = new Date(reportData.metadata.dateRange.from).toISOString().split('T')[0];
      const endDate = new Date(reportData.metadata.dateRange.to).toISOString().split('T')[0];
      const filename = `reporte-conceptos-turnos-${startDate}-${endDate}.html`;

      // Retornar HTML que puede ser convertido a PDF por el navegador
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${filename}"`,
        },
      });
    }

    // Formato no soportado
    return NextResponse.json(
      { error: 'Formato no soportado' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error generando reporte de conceptos por turnos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// GET para obtener configuraciones predefinidas o metadatos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'config':
        // Retornar configuraciones predefinidas
        return NextResponse.json({
          predefinedConfigs: {
            daily_cash_flow: {
              name: 'Flujo de Efectivo Diario',
              description: 'Reporte de entradas y salidas por turno',
              groupBy: 'turno',
              paymentTypes: ['CASH', 'CARD'],
              includeDetails: true,
              showTotals: true,
            },
            shift_summary: {
              name: 'Resumen por Turnos',
              description: 'Resumen ejecutivo sin detalles',
              groupBy: 'turno',
              includeDetails: false,
              showTotals: true,
            },
            detailed_movements: {
              name: 'Movimientos Detallados',
              description: 'Todos los movimientos con detalles completos',
              groupBy: 'date',
              includeDetails: true,
              showTotals: true,
            },
          },
          availableOptions: {
            groupBy: [
              { value: 'turno', label: 'Por Turno' },
              { value: 'date', label: 'Por Fecha' },
              { value: 'user', label: 'Por Usuario' },
              { value: 'currency', label: 'Por Moneda' },
              { value: 'paymentType', label: 'Por Tipo de Pago' },
            ],
            currencies: [
              { value: 'MXN', label: 'Pesos Mexicanos' },
              { value: 'USD', label: 'Dólares Americanos' },
              { value: 'EUR', label: 'Euros' },
            ],
            paymentTypes: [
              { value: 'CASH', label: 'Efectivo' },
              { value: 'CARD', label: 'Tarjeta' },
              { value: 'TRANSFER', label: 'Transferencia' },
              { value: 'CHECK', label: 'Cheque' },
              { value: 'OTHER', label: 'Otro' },
            ],
            formats: [
              { value: 'JSON', label: 'Datos JSON' },
              { value: 'PDF', label: 'Documento PDF' },
            ],
          },
        });

      case 'turnos':
        // TODO: Obtener turnos activos desde la base de datos
        return NextResponse.json({
          turnos: [
            { numero: 1, nombre: 'Turno Matutino', inicio: '06:00', fin: '14:00' },
            { numero: 2, nombre: 'Turno Vespertino', inicio: '14:00', fin: '22:00' },
            { numero: 3, nombre: 'Turno Nocturno', inicio: '22:00', fin: '06:00' },
          ],
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en GET /api/reports/turn-concepts:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
