import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PdfService } from '@common/services/pdf.service';
import { ExcelService } from '@common/services/excel.service';

@Module({
  imports: [PrismaModule],
  providers: [ReportsService, PdfService, ExcelService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
