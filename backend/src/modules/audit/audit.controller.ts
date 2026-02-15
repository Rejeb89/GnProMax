import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @RequirePermissions('audit.read')
  findLogs(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.auditService.findLogs(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get('logs/module/:module')
  @RequirePermissions('audit.read')
  findLogsByModule(
    @CurrentUser() currentUser: CurrentUser,
    @Param('module') module: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.auditService.findLogsByModule(
      currentUser,
      module,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get('logs/user/:userId')
  @RequirePermissions('audit.read')
  findLogsByUser(
    @CurrentUser() currentUser: CurrentUser,
    @Param('userId') userId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.auditService.findLogsByUser(
      currentUser,
      userId,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get('logs/resource/:resourceId')
  @RequirePermissions('audit.read')
  findLogsByResource(
    @CurrentUser() currentUser: CurrentUser,
    @Param('resourceId') resourceId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.auditService.findLogsByResource(
      currentUser,
      resourceId,
      parseInt(skip),
      parseInt(take),
    );
  }
}
