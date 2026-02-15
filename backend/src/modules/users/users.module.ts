import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { EncryptionService } from '@common/services/encryption.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, EncryptionService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
