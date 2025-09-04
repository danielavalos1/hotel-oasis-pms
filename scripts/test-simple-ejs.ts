// Test simple para verificar PDF con EJS
// Ejecutar con: npx tsx scripts/test-simple-ejs.ts

import { generatePDF } from "pdf-node";
import fs from "fs/promises";
import path from "path";

async function testSimpleEJS() {
  console.log("🧪 Test simple EJS PDF\n");

  try {
    // HTML template simple con EJS
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Test EJS</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { background: #f0f0f0; padding: 15px; text-align: center; }
        .content { margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1><%= title %></h1>
        <p>Generado: <%= date %></p>
      </div>
      <div class="content">
        <h2>Hotel: <%= hotel.name %></h2>
        <p>Dirección: <%= hotel.address %></p>
        <p>Teléfono: <%= hotel.phone %></p>
        
        <h3>Items:</h3>
        <ul>
          <% items.forEach(function(item) { %>
          <li><%= item.name %>: <%= item.value %></li>
          <% }); %>
        </ul>
      </div>
    </body>
    </html>`;

    // Datos de prueba
    const testData = {
      title: "Test PDF con EJS",
      date: new Date().toLocaleDateString('es-ES'),
      hotel: {
        name: "Hotel Prueba EJS",
        address: "123 Calle de Prueba",
        phone: "+1 234-567-8900"
      },
      items: [
        { name: "Motor", value: "EJS" },
        { name: "Biblioteca", value: "pdf-node" },
        { name: "Estado", value: "Funcionando" }
      ]
    };

    console.log("📄 Generando PDF con EJS...");

    const result = await generatePDF({
      html: htmlTemplate,
      data: testData,
      engine: "ejs", // Usar EJS
      buffer: true,
      cacheTemplate: false,
      pdfOptions: {
        format: "A4",
        orientation: "portrait",
        border: "10mm"
      }
    } as any);

    if ('buffer' in result) {
      const outputPath = path.join(process.cwd(), "test-simple-ejs.pdf");
      await fs.writeFile(outputPath, result.buffer);
      
      console.log("✅ PDF generado exitosamente!");
      console.log(`📁 Archivo: ${outputPath}`);
      console.log(`📊 Tamaño: ${(result.buffer.length / 1024).toFixed(2)} KB`);
    } else {
      console.log("❌ No se generó buffer");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testSimpleEJS();
