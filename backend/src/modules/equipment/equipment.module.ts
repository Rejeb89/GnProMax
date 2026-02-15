import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { QrCodeService } from '@common/services/qr-code.service';

@Module({
  imports: [PrismaModule],
  providers: [EquipmentService, QrCodeService],
  controllers: [EquipmentController],
  exports: [EquipmentService],
})
export class EquipmentModule {}
