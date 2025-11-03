// utils/pdfGenerator.js

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generate PDF invoice with user data
 * @param {Object} data - Invoice data
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateInvoicePDF(data) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Header
    page.drawText('MyCanteen Invoice', {
      x: 50, y: 750, size: 24, font: boldFont, color: rgb(0.1, 0.3, 0.8)
    });
    
    // Invoice details
    page.drawText(`Invoice #: ${data.invoiceNumber}`, {
      x: 50, y: 700, size: 11, font: font
    });
    
    page.drawText(`Date: ${data.date}`, {
      x: 50, y: 680, size: 11, font: font
    });
    
    // Customer info section
    page.drawText('Customer Information', {
      x: 50, y: 640, size: 12, font: boldFont, color: rgb(0.1, 0.3, 0.8)
    });
    
    page.drawText(`Name: ${data.user.name}`, {
      x: 50, y: 620, size: 11, font: font
    });
    
    page.drawText(`Student ID: ${data.user.id}`, {
      x: 50, y: 600, size: 11, font: font
    });
    
    page.drawText(`Department: ${data.user.department || 'N/A'}`, {
      x: 50, y: 580, size: 11, font: font
    });
    
    // Date range
    page.drawText(`Period: ${data.dateRange?.start || 'N/A'} to ${data.dateRange?.end || 'N/A'}`, {
      x: 50, y: 560, size: 11, font: font
    });
    
    // Meals header
    page.drawText('Meals Purchased', {
      x: 50, y: 520, size: 12, font: boldFont, color: rgb(0.1, 0.3, 0.8)
    });
    
    // Table headers
    let yPos = 500;
    const colX = [50, 150, 250, 350, 450];
    page.drawText('Description', { x: colX[0], y: yPos, size: 10, font: boldFont });
    page.drawText('Qty', { x: colX[1], y: yPos, size: 10, font: boldFont });
    page.drawText('Unit Price', { x: colX[2], y: yPos, size: 10, font: boldFont });
    page.drawText('Total', { x: colX[3], y: yPos, size: 10, font: boldFont });
    
    // Draw separator line
    page.drawLine({
      start: { x: 50, y: yPos - 5 },
      end: { x: 500, y: yPos - 5 }
    });
    
    // Meals list
    yPos -= 25;
    if (data.meals && Array.isArray(data.meals)) {
      data.meals.forEach(meal => {
        page.drawText(meal.description || '', { 
          x: colX[0], y: yPos, size: 10, font: font 
        });
        page.drawText(`${meal.quantity || 0}`, { 
          x: colX[1], y: yPos, size: 10, font: font 
        });
        page.drawText(`Rs. ${meal.unitPrice || 0}`, { 
          x: colX[2], y: yPos, size: 10, font: font 
        });
        page.drawText(`Rs. ${meal.total || 0}`, { 
          x: colX[3], y: yPos, size: 10, font: font 
        });
        yPos -= 20;
      });
    }
    
    // Total separator
    yPos -= 10;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: 500, y: yPos }
    });
    
    // Total amount
    yPos -= 20;
    page.drawText('Total Amount:', {
      x: 350, y: yPos, size: 12, font: boldFont
    });
    
    page.drawText(`Rs. ${data.totalAmount || 0}`, {
      x: 450, y: yPos, size: 12, font: boldFont, color: rgb(0.8, 0.1, 0.1)
    });
    
    // Footer
    page.drawText('Thank you for using MyCanteen!', {
      x: 50, y: 50, size: 10, font: font, color: rgb(0.5, 0.5, 0.5)
    });
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}