import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  private readonly logger = new Logger('PdfService');

  generateReportPdf(
    title: string,
    data: any[],
    columns: string[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Title
        doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
        doc.moveDown();

        // Metadata
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        // Table header
        const columnWidth = (doc.page.width - 100) / columns.length;
        let x = 50;
        doc.font('Helvetica-Bold').fontSize(11);
        columns.forEach((column) => {
          doc.text(column, x, doc.y, { width: columnWidth });
          x += columnWidth;
        });

        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown();

        // Table data
        doc.font('Helvetica').fontSize(10);
        data.forEach((row) => {
          x = 50;
          columns.forEach((column) => {
            const value = row[column.toLowerCase()] || '';
            doc.text(String(value), x, doc.y, {
              width: columnWidth,
              height: 20,
            });
            x += columnWidth;
          });
          doc.moveDown();
        });

        doc.end();
      } catch (error) {
        this.logger.error(`Failed to generate PDF: ${(error as Error).message}`);
        reject(error);
      }
    });
  }

  generateSimplePdf(title: string, content: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text(content);
        doc.end();
      } catch (error) {
        this.logger.error(`Failed to generate simple PDF: ${(error as Error).message}`);
        reject(error);
      }
    });
  }
}
