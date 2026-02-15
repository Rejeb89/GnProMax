import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('expenses')
  @RequirePermissions('reports.read')
  async getExpenseReport(
    @CurrentUser() currentUser: CurrentUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getExpenseReport(currentUser, startDate, endDate);
  }

  @Get('revenues')
  @RequirePermissions('reports.read')
  async getRevenueReport(
    @CurrentUser() currentUser: CurrentUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getRevenueReport(currentUser, startDate, endDate);
  }

  @Get('equipment')
  @RequirePermissions('reports.read')
  async getEquipmentReport(@CurrentUser() currentUser: CurrentUser) {
    return this.reportsService.getEquipmentReport(currentUser);
  }

  @Get('employees')
  @RequirePermissions('reports.read')
  async getEmployeeReport(@CurrentUser() currentUser: CurrentUser) {
    return this.reportsService.getEmployeeReport(currentUser);
  }

  @Get('vehicles')
  @RequirePermissions('reports.read')
  async getVehicleReport(@CurrentUser() currentUser: CurrentUser) {
    return this.reportsService.getVehicleReport(currentUser);
  }

  @Get('expenses/pdf')
  @RequirePermissions('reports.read')
  async generateExpensePdf(
    @CurrentUser() currentUser: CurrentUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const pdf = await this.reportsService.generateExpensePdf(
      currentUser,
      startDate,
      endDate,
    );
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="expense-report.pdf"',
    });
    response.send(pdf);
  }

  @Get('expenses/excel')
  @RequirePermissions('reports.read')
  async generateExpenseExcel(
    @CurrentUser() currentUser: CurrentUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const excel = await this.reportsService.generateExpenseExcel(
      currentUser,
      startDate,
      endDate,
    );
    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="expense-report.xlsx"',
    });
    response.send(excel);
  }

  @Get('revenues/excel')
  @RequirePermissions('reports.read')
  async generateRevenueExcel(
    @CurrentUser() currentUser: CurrentUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const excel = await this.reportsService.generateRevenueExcel(
      currentUser,
      startDate,
      endDate,
    );
    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="revenue-report.xlsx"',
    });
    response.send(excel);
  }

  @Get('equipment/excel')
  @RequirePermissions('reports.read')
  async generateEquipmentExcel(
    @CurrentUser() currentUser: CurrentUser,
    @Res() response: Response,
  ) {
    const excel = await this.reportsService.generateEquipmentExcel(currentUser);
    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="equipment-report.xlsx"',
    });
    response.send(excel);
  }
}
