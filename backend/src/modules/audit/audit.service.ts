import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditService');

  constructor(private prisma: PrismaService) {}

  async logAction(
    currentUser: CurrentUser,
    action: string,
    module: string,
    resourceId?: string,
    resourceType?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          companyId: currentUser.companyId,
          userId: currentUser.id,
          action,
          module,
          resourceId,
          resourceType,
          oldValues,
          newValues,
          metadata,
          status: 'success',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log audit: ${(error as Error).message}`);
    }
  }

  async findLogs(
    currentUser: CurrentUser,
    skip: number = 0,
    take: number = 20,
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: { companyId: currentUser.companyId },
      include: { user: true, company: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.auditLog.count({
      where: { companyId: currentUser.companyId },
    });

    return { data: logs, total, skip, take };
  }

  async findLogsByModule(
    currentUser: CurrentUser,
    module: string,
    skip: number = 0,
    take: number = 20,
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        companyId: currentUser.companyId,
        module,
      },
      include: { user: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.auditLog.count({
      where: {
        companyId: currentUser.companyId,
        module,
      },
    });

    return { data: logs, total, skip, take };
  }

  async findLogsByUser(
    currentUser: CurrentUser,
    userId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        companyId: currentUser.companyId,
        userId,
      },
      include: { user: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.auditLog.count({
      where: {
        companyId: currentUser.companyId,
        userId,
      },
    });

    return { data: logs, total, skip, take };
  }

  async findLogsByResource(
    currentUser: CurrentUser,
    resourceId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        companyId: currentUser.companyId,
        resourceId,
      },
      include: { user: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.auditLog.count({
      where: {
        companyId: currentUser.companyId,
        resourceId,
      },
    });

    return { data: logs, total, skip, take };
  }
}
