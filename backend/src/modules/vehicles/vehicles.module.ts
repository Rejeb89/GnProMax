import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { QrCodeService } from '@common/services/qr-code.service';

@Module({
  imports: [PrismaModule],
  providers: [VehiclesService, QrCodeService],
  controllers: [VehiclesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
