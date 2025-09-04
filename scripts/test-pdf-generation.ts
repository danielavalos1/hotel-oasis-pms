// Test script para verificar la generación de PDFs con Handlebars
// Ejecutar con: npx tsx scripts/test-pdf-generation.ts

import { generatePDF } from "pdf-node";
import fs from "fs/promises";
import path from "path";

console.log("🖥️ INFORMACIÓN DEL SISTEMA\n");

console.log("📦 Dependencias relacionadas:");
try {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "package.json"), "utf-8")
  );
  console.log(`   pdf-node: ${packageJson.dependencies["pdf-node"]}`);
  console.log(`   handlebars: ${packageJson.dependencies["handlebars"]}`);
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Plataforma: ${process.platform}\n`);
} catch (error) {
  console.log("   ❌ Error leyendo package.json\n");
}

console.log("🧪 Iniciando prueba de generación de PDF...\n");

async function testPDFGeneration() {
  try {
    // Configurar la ruta de PhantomJS
    const phantomPath = path.join(process.cwd(), "node_modules/.bin/phantomjs");
    console.log(`🔧 PhantomJS Path: ${phantomPath}`);
    
    // Verificar que PhantomJS existe
    try {
      await fs.access(phantomPath);
      console.log("✅ PhantomJS binary encontrado!");
    } catch {
      console.log("❌ PhantomJS binary no encontrado!");
      return;
    }
    
    // HTML simple de prueba con Handlebars
    const testHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>{{title}}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              background: #f5f5f5;
              padding: 20px;
              text-align: center;
              margin-bottom: 20px;
            }
            .content {
              margin: 20px 0;
            }
            .test-data {
              border: 1px solid #ccc;
              padding: 15px;
              margin: 10px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>{{title}}</h1>
            <p>Fecha: {{currentDate}}</p>
          </div>
          
          <div class="content">
            <h2>Test de generación PDF</h2>
            <p>Esta es una prueba para verificar que pdf-node funciona correctamente con Handlebars.</p>
            
            <div class="test-data">
              <h3>Hotel: {{hotel.name}}</h3>
              <p>Dirección: {{hotel.address}}</p>
              <p>Teléfono: {{hotel.phone}}</p>
            </div>

            <div class="test-data">
              <h3>Datos de Prueba</h3>
              <ul>
                {{#each testItems}}
                <li>{{name}}: {{value}}</li>
                {{/each}}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    // Datos de prueba para la plantilla
    const testData = {
      title: "Prueba PDF - Hotel Oasis PMS",
      currentDate: new Date().toLocaleDateString('es-ES'),
      hotel: {
        name: "Hotel Test",
        address: "123 Test Street",
        phone: "+1 234-567-8900",
      },
      testItems: [
        { name: "Motor de plantillas", value: "Handlebars" },
        { name: "Biblioteca PDF", value: "pdf-node" },
        { name: "Estado", value: "Funcionando ✅" }
      ]
    };

    console.log("📄 Generando PDF de prueba con Handlebars...");
    
    // Generar PDF con pdf-node
    const result = await generatePDF({
      html: testHTML,
      data: testData,
      buffer: true,
      engine: "handlebars" as const, // Usar Handlebars
      pdfOptions: {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        phantomPath: phantomPath, // Configurar la ruta de PhantomJS
      },
    });

    if ('buffer' in result) {
      // Guardar el PDF de prueba
      const outputPath = path.join(process.cwd(), "test-handlebars-report.pdf");
      await fs.writeFile(outputPath, result.buffer);
      
      console.log("✅ PDF generado exitosamente!");
      console.log(`📁 Archivo guardado en: ${outputPath}`);
      console.log(`📊 Tamaño del archivo: ${(result.buffer.length / 1024).toFixed(2)} KB`);
      
      return true;
    } else {
      console.log("❌ Error: No se generó buffer del PDF");
      return false;
    }

  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    
    if (error instanceof Error) {
      console.error("   Mensaje:", error.message);
      if (error.stack) {
        console.error("   Stack:", error.stack.split('\n').slice(0, 5).join('\n'));
      }
    }
    
    console.log("\n Posibles soluciones:");
    console.log("1. Verificar que pdf-node esté instalado: pnpm list pdf-node");
    console.log("2. Reinstalar dependencias: pnpm install");
    console.log("3. Verificar que handlebars esté instalado: pnpm list handlebars");
    console.log("4. Verificar que PhantomJS esté instalado correctamente");
    
    return false;
  }
}

// Función principal
async function main() {
  const success = await testPDFGeneration();
  
  if (success) {
    console.log("\n🚀 El sistema de reportes PDF está listo para usar!");
    process.exit(0);
  } else {
    console.log("\n💥 Hay problemas con la generación de PDF.");
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

export { testPDFGeneration };
