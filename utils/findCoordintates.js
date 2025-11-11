// utils/findCoordinates.js - Helper to find exact coordinates

import fs from 'fs';
import path from 'path';

/**
 * This function helps you find the exact coordinates for text placement
 * Run this once to get coordinates, then use them in the main generator
 */
export async function findPDFCoordinates() {
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    
    // Read template
    const templatePath = path.join(process.cwd(), 'public', 'MyCanteen_temp_invoice.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    console.log(`Page dimensions: ${width} x ${height}`);
    
    // Add coordinate grid for reference
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Draw grid lines every 50 pixels
    for (let x = 0; x <= width; x += 50) {
      firstPage.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Label X coordinates
      firstPage.drawText(x.toString(), {
        x: x + 2,
        y: 10,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    for (let y = 0; y <= height; y += 50) {
      firstPage.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Label Y coordinates
      firstPage.drawText(y.toString(), {
        x: 5,
        y: y + 2,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    // Add some test text to help you identify positions
    firstPage.drawText('INVOICE NUMBER HERE', {
      x: 100,
      y: 700,
      size: 10,
      font: font,
      color: rgb(1, 0, 0), // Red color for visibility
    });
    
    firstPage.drawText('DATE HERE', {
      x: 100,
      y: 680,
      size: 10,
      font: font,
      color: rgb(1, 0, 0),
    });
    
    firstPage.drawText('CUSTOMER NAME HERE', {
      x: 100,
      y: 600,
      size: 10,
      font: font,
      color: rgb(1, 0, 0),
    });
    
    // Save coordinate reference PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(process.cwd(), 'public', 'coordinate_reference.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log('Coordinate reference PDF saved to public/coordinate_reference.pdf');
    console.log('Open this file to see the grid and find exact coordinates for your fields');
    
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error creating coordinate reference:', error);
    throw error;
  }
}