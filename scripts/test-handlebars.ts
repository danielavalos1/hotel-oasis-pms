import { generatePDF } from "pdf-node";
import fs from "fs/promises";
import path from "path";

async function testPDFWithHandlebars() {
  console.log("Testing PDF generation with Handlebars...\n");
  
  const phantomPath = path.join(process.cwd(), "node_modules/.bin/phantomjs");
  console.log("PhantomJS path:", phantomPath);
  
  const testHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { background: #f5f5f5; padding: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{title}}</h1>
    <p>Hotel: {{hotel.name}}</p>
  </div>
  <div>
    <h2>Items:</h2>
    <ul>
      {{#each items}}
      <li>{{name}}: {{value}}</li>
      {{/each}}
    </ul>
  </div>
</body>
</html>`;

  const testData = {
    title: "Test PDF with Handlebars",
    hotel: { name: "Test Hotel" },
    items: [
      { name: "Engine", value: "Handlebars" },
      { name: "Library", value: "pdf-node" }
    ]
  };

  try {
    const result = await generatePDF({
      html: testHTML,
      data: testData,
      buffer: true,
      pdfOptions: {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        phantomPath: phantomPath
      }
    });

    if ('buffer' in result) {
      const outputPath = path.join(process.cwd(), "test-handlebars.pdf");
      await fs.writeFile(outputPath, result.buffer);
      console.log("✅ PDF generated successfully!");
      console.log("File saved to:", outputPath);
    } else {
      console.log("❌ No buffer generated");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testPDFWithHandlebars();
