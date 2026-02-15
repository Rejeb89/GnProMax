import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { PdfService } from '@common/services/pdf.service';
import { ExcelService } from '@common/services/excel.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger('ReportsService');

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private excelService: ExcelService,
  ) {}

  async getExpenseReport(
    currentUser: CurrentUser,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId: currentUser.companyId,
        expenseDate: {
          gte: start,
          lte: end,
        },
      },
      include: { branch: true },
      orderBy: { expenseDate: 'desc' },
    });

    return {
      period: `${startDate} to ${endDate}`,
      totalExpenses: expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0),
      count: expenses.length,
      data: expenses,
    };
  }

  async getRevenueReport(
    currentUser: CurrentUser,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const revenues = await this.prisma.revenue.findMany({
      where: {
        companyId: currentUser.companyId,
        revenueDate: {
          gte: start,
          lte: end,
        },
      },
      include: { branch: true },
      orderBy: { revenueDate: 'desc' },
    });

    return {
      period: `${startDate} to ${endDate}`,
      totalRevenues: revenues.reduce((sum: number, rev: any) => sum + Number(rev.amount), 0),
      count: revenues.length,
      data: revenues,
    };
  }

  async getEquipmentReport(currentUser: CurrentUser) {
    const equipment = await this.prisma.equipment.findMany({
      where: { companyId: currentUser.companyId },
      include: {
        branch: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const summary = {
      total: equipment.length,
      byStatus: {} as Record<string, number>,
      byCondition: {} as Record<string, number>,
    };

    equipment.forEach((item: any) => {
      summary.byStatus[item.status] = (summary.byStatus[item.status] || 0) + 1;
      if (item.condition) {
        summary.byCondition[item.condition] =
          (summary.byCondition[item.condition] || 0) + 1;
      }
    });

    return { summary, data: equipment };
  }

  async getEmployeeReport(currentUser: CurrentUser) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId: currentUser.companyId },
      include: { branch: true, vehicles: true },
    });

    const summary = {
      total: employees.length,
      byBranch: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
    };

    employees.forEach((emp: any) => {
      summary.byBranch[emp.branch.name] =
        (summary.byBranch[emp.branch.name] || 0) + 1;
      if (emp.department) {
        summary.byDepartment[emp.department] =
          (summary.byDepartment[emp.department] || 0) + 1;
      }
    });

    return { summary, data: employees };
  }

  async getVehicleReport(currentUser: CurrentUser) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { companyId: currentUser.companyId },
      include: { branch: true, driver: true },
    });

    const summary = {
      total: vehicles.length,
      byStatus: {} as Record<string, number>,
      byFuelType: {} as Record<string, number>,
    };

    vehicles.forEach((vehicle: any) => {
      summary.byStatus[vehicle.status] =
        (summary.byStatus[vehicle.status] || 0) + 1;
      if (vehicle.fuelType) {
        summary.byFuelType[vehicle.fuelType] =
          (summary.byFuelType[vehicle.fuelType] || 0) + 1;
      }
    });

    return { summary, data: vehicles };
  }

  async generateExpensePdf(
    currentUser: CurrentUser,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    const report = await this.getExpenseReport(currentUser, startDate, endDate);
    const data = report.data.map((item: any) => ({
      Category: item.category,
      Description: item.description,
      Amount: Number(item.amount),
      Status: item.status,
      Date: item.expenseDate.toLocaleDateString(),
    }));

    return this.pdfService.generateReportPdf(
      `Expense Report (${report.period})`,
      data,
      ['Category', 'Description', 'Amount', 'Status', 'Date'],
    );
  }

  async generateExpenseExcel(
    currentUser: CurrentUser,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    const report = await this.getExpenseReport(currentUser, startDate, endDate);
    const data = report.data.map((item: any) => ({
      Category: item.category,
      Description: item.description,
      Amount: Number(item.amount),
      Status: item.status,
      PaymentMethod: item.paymentMethod,
      Date: item.expenseDate.toLocaleDateString(),
    }));

    return this.excelService.generateExcel('Expenses', data);
  }

  async generateRevenueExcel(
    currentUser: CurrentUser,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    const report = await this.getRevenueReport(currentUser, startDate, endDate);
    const data = report.data.map((item: any) => ({
      Source: item.source,
      Description: item.description,
      Amount: Number(item.amount),
      Status: item.status,
      Date: item.revenueDate.toLocaleDateString(),
    }));

    return this.excelService.generateExcel('Revenues', data);
  }

  async generateEquipmentExcel(currentUser: CurrentUser): Promise<Buffer> {
    const { data } = await this.getEquipmentReport(currentUser);
    const rows = data.map((item: any) => ({
      Name: item.name,
      Category: item.category,
      SerialNumber: item.serialNumber,
      Status: item.status,
      Condition: item.condition,
      Location: item.location,
      PurchasePrice: Number(item.purchasePrice),
    }));

    return this.excelService.generateExcel('Equipment', rows);
  }
}
