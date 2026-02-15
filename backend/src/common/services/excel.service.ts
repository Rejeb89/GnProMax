import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  private readonly logger = new Logger('ExcelService');

  generateExcel(
    sheetName: string,
    data: any[],
    columns?: string[],
  ): Promise<Buffer> {
    try {
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      if (columns) {
        const colWidths = columns.map(() => 20);
        ws['!cols'] = colWidths.map((w) => ({ wch: w }));
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      return Promise.resolve(buffer as Buffer);
    } catch (error) {
      this.logger.error(`Failed to generate Excel: ${(error as Error).message}`);
      throw error;
    }
  }

  generateMultiSheetExcel(sheets: { name: string; data: any[] }[]): Promise<Buffer> {
    try {
      const wb = XLSX.utils.book_new();

      sheets.forEach((sheet) => {
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      });

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      return Promise.resolve(buffer as Buffer);
    } catch (error) {
      this.logger.error(`Failed to generate multi-sheet Excel: ${(error as Error).message}`);
      throw error;
    }
  }
}
