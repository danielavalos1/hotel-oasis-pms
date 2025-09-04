/**
 * Generador de PDF simple usando Puppeteer para evitar problemas de fuentes
 * Este enfoque genera HTML y luego lo convierte a PDF
 */

import { TurnReportData, TurnReportMovement, TurnReportSummary } from "../types";
import { Currency } from "@prisma/client";

export interface HotelInfo {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Genera HTML para el reporte de conceptos por turnos
 */
export function generateTurnConceptsHTML(
  reportData: TurnReportData,
  hotelInfo: HotelInfo,
  generatedByName: string
): string {
  const { movements, summary, metadata } = reportData;
  const startDate = new Date(metadata.dateRange.from).toLocaleDateString('es-ES');
  const endDate = new Date(metadata.dateRange.to).toLocaleDateString('es-ES');
  const generatedAt = new Date().toLocaleString('es-ES');

  // Información de contacto del hotel
  const contactInfo = [];
  if (hotelInfo.phone) contactInfo.push(`Tel: ${hotelInfo.phone}`);
  if (hotelInfo.email) contactInfo.push(`Email: ${hotelInfo.email}`);
  if (hotelInfo.website) contactInfo.push(`Web: ${hotelInfo.website}`);

  // Agrupar movimientos por turno
  const movementsByTurno = movements.reduce((acc, movement) => {
    const turno = movement.turno?.numero || 0;
    if (!acc[turno]) {
      acc[turno] = [];
    }
    acc[turno].push(movement);
    return acc;
  }, {} as Record<number, typeof movements>);

  // Generar HTML
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Conceptos por Turnos</title>
      <style>
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.4;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
        }
        
        .hotel-name {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .hotel-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin: 15px 0 5px 0;
        }
        
        .report-period {
          font-size: 14px;
          color: #666;
        }
        
        .metadata {
          text-align: left;
          margin: 20px 0;
          font-size: 12px;
          color: #666;
        }
        
        .metadata div {
          margin-bottom: 3px;
        }
        
        .turn-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .turn-header {
          background-color: #f3f4f6;
          padding: 10px;
          border-left: 4px solid #2563eb;
          margin-bottom: 15px;
        }
        
        .turn-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
        }
        
        .turn-info {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .concepts-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 9px;
          table-layout: fixed;
        }
        
        .concepts-table th {
          background-color: #e5e7eb;
          padding: 4px 6px;
          text-align: left;
          border: 1px solid #d1d5db;
          font-weight: bold;
          color: #374151;
          font-size: 8px;
        }
        
        .concepts-table td {
          padding: 3px 6px;
          border: 1px solid #d1d5db;
          word-wrap: break-word;
          font-size: 8px;
        }
        
        /* Ancho específico para cada columna */
        .concepts-table th:nth-child(1), .concepts-table td:nth-child(1) { width: 8%; }  /* Fecha */
        .concepts-table th:nth-child(2), .concepts-table td:nth-child(2) { width: 12%; } /* Concepto */
        .concepts-table th:nth-child(3), .concepts-table td:nth-child(3) { width: 10%; } /* Referencia */
        .concepts-table th:nth-child(4), .concepts-table td:nth-child(4) { width: 12%; } /* Cliente */
        .concepts-table th:nth-child(5), .concepts-table td:nth-child(5) { width: 8%; }  /* Subtotal */
        .concepts-table th:nth-child(6), .concepts-table td:nth-child(6) { width: 8%; }  /* IVA */
        .concepts-table th:nth-child(7), .concepts-table td:nth-child(7) { width: 8%; }  /* Imp 3% */
        .concepts-table th:nth-child(8), .concepts-table td:nth-child(8) { width: 10%; } /* Total */
        .concepts-table th:nth-child(9), .concepts-table td:nth-child(9) { width: 10%; } /* Turno */
        .concepts-table th:nth-child(10), .concepts-table td:nth-child(10) { width: 10%; } /* Usuario */
        .concepts-table th:nth-child(11), .concepts-table td:nth-child(11) { width: 8%; } /* Tipo */
        
        .concepts-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .amount {
          text-align: right;
          font-weight: bold;
        }
        
        .positive {
          color: #059669;
        }
        
        .negative {
          color: #dc2626;
        }
        
        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }
        
        .summary-section {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 5px;
        }
        
        .summary-title {
          font-size: 16px;
          font-weight: bold;
          color: #0369a1;
          margin-bottom: 10px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .summary-item {
          font-size: 12px;
        }
        
        .summary-label {
          font-weight: bold;
          color: #374151;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          
          .turn-section {
            page-break-inside: avoid;
          }
          
          .concepts-table {
            font-size: 7px;
          }
          
          .concepts-table th {
            font-size: 7px;
            padding: 2px 4px;
          }
          
          .concepts-table td {
            font-size: 7px;
            padding: 2px 4px;
          }
        }
      </style>
    </head>
    <body>
      <!-- Encabezado -->
      <div class="header">
        <div class="hotel-name">${hotelInfo.name}</div>
        ${hotelInfo.address ? `<div class="hotel-info">${hotelInfo.address}</div>` : ''}
        ${contactInfo.length > 0 ? `<div class="hotel-info">${contactInfo.join(' • ')}</div>` : ''}
        <div class="report-title">Reporte de Conceptos por Turnos</div>
        <div class="report-period">Período: ${startDate} - ${endDate}</div>
      </div>
      
      <!-- Metadatos -->
      <div class="metadata">
        <div>Generado por: ${generatedByName}</div>
        <div>Fecha de generación: ${generatedAt}</div>
        <div>Total de turnos: ${summary.length}</div>
        <div>Total de registros: ${metadata.totalRecords}</div>
      </div>
      
      <!-- Secciones por turno -->
      ${Object.entries(movementsByTurno).map(([turno, turnMovements], index) => 
        generateTurnSection(parseInt(turno), turnMovements, summary, index > 0)
      ).join('')}
      
      <!-- Resumen -->
      ${generateSummarySection(summary)}
      
    </body>
    </html>
  `;

  return html;
}

/**
 * Genera la sección HTML para un turno específico
 */
function generateTurnSection(
  turno: number,
  movements: TurnReportMovement[],
  summary: TurnReportSummary[],
  addPageBreak: boolean
): string {
  const turnSummary = summary.find(s => s.turno === turno);
  const turnName = turnSummary?.turnoName || `Turno ${turno}`;
  
  return `
    ${addPageBreak ? '<div class="page-break"></div>' : ''}
    <div class="turn-section">
      <div class="turn-header">
        <div class="turn-title">${turnName}</div>
        <div class="turn-info">
          Total de movimientos: ${movements.length} • 
          Total de registros: ${turnSummary?.totalMovements || 0}
        </div>
      </div>
      
      ${movements.length > 0 ? generateConceptsTable(movements) : '<div class="no-data">No hay conceptos registrados para este turno</div>'}
    </div>
  `;
}

/**
 * Genera la tabla HTML de conceptos
 */
function generateConceptsTable(movements: TurnReportMovement[]): string {
  return `
    <table class="concepts-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Concepto</th>
          <th>Referencia</th>
          <th>Cliente</th>
          <th>Subtotal</th>
          <th>IVA (16%)</th>
          <th>Imp. 3%</th>
          <th>Total</th>
          <th>Turno</th>
          <th>Usuario</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        ${movements.map(movement => {
          const customerName = movement.customer?.name || movement.booking?.guestName || 'Sin cliente';
          const userName = movement.user ? `${movement.user.name} ${movement.user.lastName || ''}`.trim() : 'Sin usuario';
          const turnoName = movement.turno ? `${movement.turno.nombre}` : 'Sin turno';
          
          return `
            <tr>
              <td>${new Date(movement.date).toLocaleDateString('es-ES')}</td>
              <td>${movement.concept || 'Sin concepto'}</td>
              <td>${movement.reference || '-'}</td>
              <td>${customerName}</td>
              <td class="amount">${formatCurrency(movement.subtotal, movement.currency)}</td>
              <td class="amount">${formatCurrency(movement.tax, movement.currency)}</td>
              <td class="amount">${formatCurrency(movement.serviceFee, movement.currency)}</td>
              <td class="amount ${movement.isIncome ? 'positive' : 'negative'}">
                ${formatCurrency(movement.totalPaid, movement.currency)}
              </td>
              <td>${turnoName}</td>
              <td>${userName}</td>
              <td>${movement.type}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Genera la sección de resumen
 */
function generateSummarySection(summary: TurnReportSummary[]): string {
  return `
    <div class="summary-section">
      <div class="summary-title">Resumen por Turnos</div>
      <div class="summary-grid">
        ${summary.map(turnSummary => {
          // Obtener el primer total disponible para mostrar
          const currencies = Object.keys(turnSummary.totals) as Currency[];
          const firstCurrency = currencies[0];
          const total = firstCurrency ? turnSummary.totals[firstCurrency]?.net || 0 : 0;
          
          return `
            <div class="summary-item">
              <div class="summary-label">Turno: ${turnSummary.turnoName}</div>
              <div>Movimientos: ${turnSummary.totalMovements}</div>
              <div>Total: ${firstCurrency ? formatCurrency(total, firstCurrency) : 'N/A'}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Formatea un monto según la moneda
 */
function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Genera un PDF usando un enfoque simple que retorna HTML como fallback
 * En lugar de Puppeteer, retornará el HTML que puede ser convertido a PDF por el navegador
 */
export async function generateTurnConceptsPDFFromHTML(
  reportData: TurnReportData,
  hotelInfo: HotelInfo,
  generatedByName: string
): Promise<{ html: string; error?: string }> {
  try {
    // Generar HTML
    const html = generateTurnConceptsHTML(reportData, hotelInfo, generatedByName);
    
    return { html };
    
  } catch (error) {
    console.error('Error generando HTML del reporte:', error);
    return { 
      html: '', 
      error: 'No se pudo generar el HTML del reporte' 
    };
  }
}
