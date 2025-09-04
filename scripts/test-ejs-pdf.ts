// Test script para verificar la generación de PDFs con EJS
// Ejecutar con: npx tsx scripts/test-ejs-pdf.ts

import { generatePDF } from "pdf-node";
import fs from "fs/promises";
import path from "path";
import ejs from "ejs";

console.log("🧪 Test de generación PDF con EJS\n");

async function testEJSPDF() {
  try {
    // Configurar PhantomJS path
    const phantomPath = path.join(process.cwd(), "node_modules/.pnpm/phantomjs-prebuilt@2.1.16/node_modules/phantomjs-prebuilt/bin/phantomjs");
    
    // Datos de prueba
    const testData = {
      hotel: {
        name: "Hotel Test EJS",
        address: "123 Test Street",
        phone: "+1 234-567-8900",
        email: "test@hotel.com"
      },
      reportData: {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        currency: "USD",
        turns: [
          {
            name: "Turno Matutino",
            startDate: new Date("2024-01-15"),
            startTime: "08:00",
            endTime: "16:00",
            staff: ["Staff 1", "Staff 2", "Staff 3"],
            concepts: [
              {
                name: "Concepto de Prueba 1",
                category: "Ingreso",
                type: "Servicio",
                quantity: 2,
                amount: 150.00
              },
              {
                name: "Concepto de Prueba 2",
                category: "Gasto",
                type: "Material",
                quantity: 1,
                amount: -50.00
              }
            ],
            totalIncome: 150.00,
            totalExpenses: 50.00,
            netBalance: 100.00
          }
        ]
      },
      generatedBy: "Sistema de Pruebas EJS",
      generatedAt: new Date(),
      
      // Helper functions para EJS
      formatDate: (date: Date) => date.toLocaleDateString('es-ES'),
      formatDateTime: (date: Date) => date.toLocaleString('es-ES'),
      formatTime: (time: string) => time,
      formatCurrency: (currency: string) => currency,
      formatMoney: (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`,
      isPositive: (amount: number) => amount >= 0,
    };

    console.log("📄 Cargando plantilla EJS...");
    
    // Cargar plantilla
    const templatePath = path.join(
      process.cwd(),
      "lib/reports/templates/turn-concepts-template-simple.ejs"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    
    console.log("✅ Plantilla cargada!");

    console.log("🔄 Renderizando HTML con EJS...");
    
    // Renderizar con EJS
    const html = await ejs.render(templateContent, testData, { async: true });
    
    console.log("✅ HTML renderizado!");

    console.log("📊 Generando PDF...");
    
    // Generar PDF
    const result = await generatePDF({
      html: html,
      data: testData,
      buffer: true,
      pdfOptions: {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        phantomPath: phantomPath,
      },
    } as any);

    if ('buffer' in result) {
      const outputPath = path.join(process.cwd(), "test-ejs-report.pdf");
      await fs.writeFile(outputPath, result.buffer);
      
      console.log("✅ PDF generado exitosamente!");
      console.log(`📁 Archivo: ${outputPath}`);
      console.log(`📊 Tamaño: ${(result.buffer.length / 1024).toFixed(2)} KB`);
    } else {
      console.log("❌ Error: No se generó buffer del PDF");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error instanceof Error) {
      console.error("   Mensaje:", error.message);
    }
    
    process.exit(1);
  }
}

testEJSPDF();
