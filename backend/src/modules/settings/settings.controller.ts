import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getSettings(@CurrentUser() user: any) {
    return this.settingsService.getSettings(user.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateSettings(@CurrentUser() user: any, @Body() dto: UpdateSettingsDto) {
    // dto is validated by global ValidationPipe
    const settings = { ...dto } as any;
    return this.settingsService.updateSettings(user.companyId, settings);
  }
}
