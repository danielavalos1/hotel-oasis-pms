// Servi// Interfaz para tipado de PDFKit
interface PDFDoc {
  // Propiedades
  y: number;
  
  // Métodos de estilo y fuente  
  fontSize(size: number): PDFDoc;
  font(font: string): PDFDoc;
  fillColor(color: string): PDFDoc;
  strokeColor(color: string): PDFDoc;
  lineWidth(width: number): PDFDoc;
  
  // Métodos de texto y posicionamiento
  text(text: string, options?: Record<string, unknown>): PDFDoc;
  text(text: string, x?: number, y?: number, options?: Record<string, unknown>): PDFDoc;
  moveDown(lines?: number): PDFDoc;
  
  // Métodos de dibujo
  rect(x: number, y: number, width: number, height: number): PDFDoc;
  moveTo(x: number, y: number): PDFDoc;
  lineTo(x: number, y: number): PDFDoc;
  stroke(): PDFDoc;
  fill(): PDFDoc;
  addPage(): PDFDoc;
  
  // Métodos de eventos
  on(event: 'data', listener: (chunk: unknown) => void): PDFDoc;
  on(event: 'end', listener: () => void): PDFDoc;
  on(event: 'error', listener: (error: Error) => void): PDFDoc;
  
  // Método para finalizar
  end(): void;
}

/**
 * Utilidades de reportes de conceptos por turnos usando PDFKit
 * Archivo: lib/reports/utils/pdf-generator.ts
 */

import * as fs from "fs/promises";
import * as path from "path";
import { TurnReportData } from "../types";
import { Currency } from "@prisma/client";

// Interfaz para tipado de PDFKit
interface PDFDoc {
  // Métodos de estilo y fuente
  fontSize(size: number): PDFDoc;
  font(font: string): PDFDoc;
  fillColor(color: string): PDFDoc;
  strokeColor(color: string): PDFDoc;
  
  // Métodos de texto y posicionamiento
  text(text: string, x?: number, y?: number, options?: Record<string, unknown>): PDFDoc;
  moveDown(lines?: number): PDFDoc;
  
  // Métodos de eventos (usando tipos más específicos)
  on(event: 'data', listener: (chunk: unknown) => void): PDFDoc;
  on(event: 'end', listener: () => void): PDFDoc;
  on(event: 'error', listener: (error: Error) => void): PDFDoc;
  
  // Método para finalizar
  end(): void;
}

// Interfaces de la aplicación
export interface HotelInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Opciones de PDFKit
export interface PDFKitOptions {
  format?: "A4" | "Letter";
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  info?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
  };
}

const DEFAULT_PDF_OPTIONS: PDFKitOptions = {
  format: "A4",
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },
  info: {
    title: "Reporte de Conceptos por Turnos",
    author: "Hotel Oasis PMS",
    subject: "Reporte Financiero",
    creator: "Hotel Oasis PMS",
  },
};

/**
 * Genera un PDF del reporte de conceptos por turnos
 */
export async function generateTurnConceptsPDF(
  reportData: TurnReportData,
  hotelInfo: HotelInfo,
  generatedByName: string,
  options: Partial<PDFKitOptions> = {}
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Importación dinámica de PDFKit para compatibilidad con Next.js
      let PDFDocument: unknown;
      
      try {
        // Intentar importación ESM
        const pdfkit = await import("pdfkit");
        PDFDocument = (pdfkit as { default?: unknown }).default || pdfkit;
      } catch {
        // Fallback a CommonJS require si falla ESM
        PDFDocument = require("pdfkit");
      }
      
      // Configurar opciones de PDF
      const pdfOptions: PDFKitOptions = {
        ...DEFAULT_PDF_OPTIONS,
        ...options,
      };

      // Crear documento PDF con configuración que evita cargar fuentes externas
      const doc = new (PDFDocument as new (options: Record<string, unknown>) => PDFDoc)({
        size: pdfOptions.format || "A4",
        margins: pdfOptions.margins,
        info: pdfOptions.info,
        // Configuración para evitar problemas con fuentes
        bufferPages: true,
      });

      // Configurar buffer para capturar el PDF
      const chunks: Buffer[] = [];
      
      // Usar tipado dinámico para eventos PDFKit
      (doc as never).on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      (doc as never).on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      
      (doc as never).on('error', (error: Error) => {
        reject(error);
      });

      // Generar contenido del PDF
      generatePDFContent(doc, reportData, hotelInfo, generatedByName);

      // Finalizar el documento
      doc.end();

    } catch (error) {
      console.error("Error generando PDF de reporte de turnos:", error);
      reject(new Error("No se pudo generar el PDF del reporte"));
    }
  });
}

/**
 * Genera el contenido del PDF usando PDFKit
 */
function generatePDFContent(
  doc: PDFDoc,
  reportData: TurnReportData,
  hotelInfo: HotelInfo,
  generatedByName: string
): void {
  // Header del reporte
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text(hotelInfo.name, { align: 'center' });

  if (hotelInfo.address || hotelInfo.phone || hotelInfo.email) {
    doc.fontSize(10)
       .font('Helvetica')
       .moveDown(0.5);
    
    if (hotelInfo.address) {
      doc.text(hotelInfo.address, { align: 'center' });
    }
    
    const contactInfo = [];
    if (hotelInfo.phone) contactInfo.push(`Tel: ${hotelInfo.phone}`);
    if (hotelInfo.email) contactInfo.push(hotelInfo.email);
    
    if (contactInfo.length > 0) {
      doc.text(contactInfo.join(' • '), { align: 'center' });
    }
  }

  // Título del reporte
  doc.moveDown(1)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Reporte de Conceptos por Turnos', { align: 'center' });

  // Período
  const startDate = new Date(reportData.metadata.dateRange.from).toLocaleDateString('es-ES');
  const endDate = new Date(reportData.metadata.dateRange.to).toLocaleDateString('es-ES');
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Período: ${startDate} - ${endDate}`, { align: 'center' });

  // Metadata
  doc.moveDown(1)
     .fontSize(10);

  const generatedAt = new Date(reportData.metadata.generatedAt).toLocaleString('es-ES');
  doc.text(`Generado por: ${generatedByName}`, { align: 'left' })
     .text(`Fecha de generación: ${generatedAt}`, { align: 'left' })
     .text(`Total de turnos: ${reportData.summary.length}`, { align: 'left' })
     .text(`Total de registros: ${reportData.metadata.totalRecords}`, { align: 'left' });

  // Línea separadora
  doc.moveDown(1)
     .strokeColor('#3b82f6')
     .lineWidth(2)
     .moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke();

  // Contenido de turnos
  reportData.summary.forEach((turnSummary, index) => {
    if (index > 0) {
      doc.addPage();
    }
    
    generateTurnSection(doc, turnSummary, reportData);
  });
}

/**
 * Genera una sección de turno en el PDF
 */
function generateTurnSection(
  doc: PDFDoc,
  turnSummary: TurnReportData['summary'][0],
  reportData: TurnReportData
): void {
  doc.moveDown(1)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(`Turno ${turnSummary.turno}: ${turnSummary.turnoName}`);

  // Información del turno
  doc.fontSize(10)
     .font('Helvetica')
     .moveDown(0.5);
  
  // Obtener movimientos para este turno
  const turnMovements = reportData.movements.filter(
    movement => movement.turno?.numero === turnSummary.turno
  );

  // Mostrar información básica del turno
  doc.text(`Total de movimientos: ${turnMovements.length}`, { align: 'left' });
  doc.text(`Total de registros: ${turnSummary.totalMovements}`, { align: 'left' });

  // Conceptos tabla
  if (turnMovements.length > 0) {
    doc.moveDown(1);
    generateConceptsTable(doc, turnMovements);
  } else {
    doc.moveDown(1)
       .fontSize(10)
       .font('Helvetica-Oblique')
       .text('No hay conceptos registrados para este turno', { align: 'center' });
  }

  // Resumen del turno
  generateTurnSummary(doc, turnSummary);
}

/**
 * Genera la tabla de conceptos
 */
function generateConceptsTable(
  doc: PDFDoc,
  movements: TurnReportData['movements']
): void {
  const tableTop = doc.y + 10;
  const itemHeight = 20;
  
  // Headers
  doc.fontSize(10)
     .font('Helvetica-Bold');
  
  doc.text('Concepto', 50, tableTop);
  doc.text('Tipo', 180, tableTop);
  doc.text('Referencia', 280, tableTop);
  doc.text('Fecha', 380, tableTop);
  doc.text('Monto', 450, tableTop);

  // Línea header
  doc.strokeColor('#d1d5db')
     .lineWidth(1)
     .moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();

  // Filas de datos
  doc.font('Helvetica')
     .fontSize(9);

  movements.forEach((movement, index) => {
    const y = tableTop + 20 + (index * itemHeight);
    
    // Alternar color de fondo (simulado con líneas)
    if (index % 2 === 0) {
      doc.fillColor('#f9fafb')
         .rect(50, y - 2, 500, itemHeight - 2)
         .fill();
    }
    
    doc.fillColor('#000');
    doc.text(movement.concept || 'Sin concepto', 50, y, { width: 120, ellipsis: true });
    doc.text(movement.type, 180, y);
    doc.text(movement.reference || '-', 280, y, { width: 90, ellipsis: true });
    doc.text(new Date(movement.date).toLocaleDateString('es-ES'), 380, y);
    
    const amount = `${movement.currency} ${movement.amount.toFixed(2)}`;
    doc.fillColor(movement.isIncome ? '#059669' : '#dc2626')
       .text(amount, 450, y);
    doc.fillColor('#000');
  });
}

/**
 * Genera el resumen del turno
 */
function generateTurnSummary(
  doc: PDFDoc,
  turnSummary: TurnReportData['summary'][0]
): void {
  doc.moveDown(2)
     .strokeColor('#e5e7eb')
     .lineWidth(1)
     .moveTo(60, doc.y)
     .lineTo(540, doc.y)
     .stroke();

  const summaryTop = doc.y + 10;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Resumen del Turno', 60, summaryTop);

  doc.fontSize(10)
     .font('Helvetica')
     .moveDown(0.5);

  const summaryY = summaryTop + 25;
  
  // Mostrar totales por cada moneda
  const currencies = Object.keys(turnSummary.totals) as Array<keyof typeof turnSummary.totals>;
  
  currencies.forEach((currency, index) => {
    const offset = index * 60;
    const totals = turnSummary.totals[currency];
    
    // Columna izquierda
    doc.fillColor('#059669')
       .text(`Ingresos (${currency}): ${totals.income.toFixed(2)}`, 60, summaryY + offset);
    
    doc.fillColor('#dc2626')
       .text(`Gastos (${currency}): ${totals.expenses.toFixed(2)}`, 60, summaryY + 15 + offset);

    // Columna derecha
    doc.fillColor('#000')
       .text(`Total movimientos: ${turnSummary.totalMovements}`, 320, summaryY + offset);
    
    const balanceColor = totals.net >= 0 ? '#059669' : '#dc2626';
    doc.fillColor(balanceColor)
       .font('Helvetica-Bold')
       .text(`Balance neto (${currency}): ${totals.net.toFixed(2)}`, 320, summaryY + 15 + offset);
  });
  
  doc.fillColor('#000')
     .font('Helvetica');
}

/**
 * Genera nombre de archivo para el PDF
 */
export function generatePDFFilename(reportData: TurnReportData): string {
  const startDate = reportData.metadata.dateRange.from
    .toISOString()
    .split("T")[0];
  const endDate = reportData.metadata.dateRange.to.toISOString().split("T")[0];
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];

  let filename = `reporte-conceptos-turnos_${startDate}_${endDate}`;

  if (reportData.config.turnos.length > 0) {
    filename += `_turnos-${reportData.config.turnos.join("-")}`;
  }

  filename += `_${timestamp}.pdf`;

  return filename;
}

/**
 * Guarda el PDF en el sistema de archivos
 */
export async function savePDFToFile(
  pdfBuffer: Buffer,
  filename: string,
  directory: string = "temp"
): Promise<string> {
  try {
    const outputDir = path.join(process.cwd(), "public", directory);

    // Crear directorio si no existe
    await fs.mkdir(outputDir, { recursive: true });

    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, pdfBuffer);

    return filePath;
  } catch (error) {
    console.error("Error guardando PDF:", error);
    throw new Error("No se pudo guardar el archivo PDF");
  }
}
