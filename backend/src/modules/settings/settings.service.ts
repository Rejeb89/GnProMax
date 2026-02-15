import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    });
    return company?.settings || {};
  }

  async updateSettings(companyId: string, settings: Partial<any>) {
    // Merge with existing settings to avoid wiping unspecified keys
    const existing = await this.getSettings(companyId);
    const merged = { ...(existing || {}), ...(settings || {}) };
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { settings: merged },
      select: { settings: true },
    });
    return updated.settings;
  }
}
