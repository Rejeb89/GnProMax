import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ApproveExpenseDto,
  CreateRevenueDto,
  UpdateRevenueDto,
} from './dto/finance.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger('FinanceService');

  constructor(private prisma: PrismaService) {}

  // Budget Operations
  async createBudget(currentUser: CurrentUser, createBudgetDto: CreateBudgetDto) {
    const { branchId } = createBudgetDto;

    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch || branch.companyId !== currentUser.companyId) {
        throw new NotFoundException('Branch not found');
      }
    }

    const budget = await this.prisma.budget.create({
      data: {
        companyId: currentUser.companyId,
        ...createBudgetDto,
      },
    });

    this.logger.log(`Budget created: ${budget.name}`);
    return budget;
  }

  async findBudgets(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const budgets = await this.prisma.budget.findMany({
      where: { companyId: currentUser.companyId },
      include: { branch: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.budget.count({
      where: { companyId: currentUser.companyId },
    });

    return { data: budgets, total, skip, take };
  }

  async findBudgetById(currentUser: CurrentUser, id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!budget || budget.companyId !== currentUser.companyId) {
      throw new NotFoundException('Budget not found');
    }

    return budget;
  }

  async updateBudget(
    currentUser: CurrentUser,
    id: string,
    updateBudgetDto: UpdateBudgetDto,
  ) {
    await this.findBudgetById(currentUser, id);

    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });

    this.logger.log(`Budget updated: ${updatedBudget.name}`);
    return updatedBudget;
  }

  async deleteBudget(currentUser: CurrentUser, id: string) {
    const budget = await this.findBudgetById(currentUser, id);

    await this.prisma.budget.delete({
      where: { id },
    });

    this.logger.log(`Budget deleted: ${budget.name}`);
    return { message: 'Budget deleted successfully' };
  }

  // Expense Operations
  async createExpense(currentUser: CurrentUser, createExpenseDto: CreateExpenseDto) {
    const { branchId } = createExpenseDto;

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    const expense = await this.prisma.expense.create({
      data: {
        companyId: currentUser.companyId,
        ...createExpenseDto,
      },
    });

    this.logger.log(`Expense created: ${expense.description}`);
    return expense;
  }

  async findExpenses(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const expenses = await this.prisma.expense.findMany({
      where: { companyId: currentUser.companyId },
      include: { branch: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.expense.count({
      where: { companyId: currentUser.companyId },
    });

    return { data: expenses, total, skip, take };
  }

  async findExpenseById(currentUser: CurrentUser, id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!expense || expense.companyId !== currentUser.companyId) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async updateExpense(
    currentUser: CurrentUser,
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    await this.findExpenseById(currentUser, id);

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
    });

    this.logger.log(`Expense updated: ${updatedExpense.description}`);
    return updatedExpense;
  }

  async approveExpense(
    currentUser: CurrentUser,
    id: string,
    approveExpenseDto: ApproveExpenseDto,
  ) {
    const expense = await this.findExpenseById(currentUser, id);

    if (!['approved', 'rejected'].includes(approveExpenseDto.status)) {
      throw new BadRequestException('Invalid status. Use "approved" or "rejected"');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        status: approveExpenseDto.status,
        approvedBy: currentUser.id,
        approvalDate: new Date(),
      },
    });

    this.logger.log(`Expense ${approveExpenseDto.status}: ${updatedExpense.description}`);
    return updatedExpense;
  }

  async deleteExpense(currentUser: CurrentUser, id: string) {
    const expense = await this.findExpenseById(currentUser, id);

    if (expense.status !== 'pending') {
      throw new BadRequestException('Only pending expenses can be deleted');
    }

    await this.prisma.expense.delete({
      where: { id },
    });

    this.logger.log(`Expense deleted: ${expense.description}`);
    return { message: 'Expense deleted successfully' };
  }

  // Revenue Operations
  async createRevenue(currentUser: CurrentUser, createRevenueDto: CreateRevenueDto) {
    const { branchId } = createRevenueDto;

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    const revenue = await this.prisma.revenue.create({
      data: {
        companyId: currentUser.companyId,
        ...createRevenueDto,
      },
    });

    this.logger.log(`Revenue created: ${revenue.source}`);
    return revenue;
  }

  async findRevenues(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const revenues = await this.prisma.revenue.findMany({
      where: { companyId: currentUser.companyId },
      include: { branch: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.revenue.count({
      where: { companyId: currentUser.companyId },
    });

    return { data: revenues, total, skip, take };
  }

  async findRevenueById(currentUser: CurrentUser, id: string) {
    const revenue = await this.prisma.revenue.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!revenue || revenue.companyId !== currentUser.companyId) {
      throw new NotFoundException('Revenue not found');
    }

    return revenue;
  }

  async updateRevenue(
    currentUser: CurrentUser,
    id: string,
    updateRevenueDto: UpdateRevenueDto,
  ) {
    await this.findRevenueById(currentUser, id);

    const updatedRevenue = await this.prisma.revenue.update({
      where: { id },
      data: updateRevenueDto,
    });

    this.logger.log(`Revenue updated: ${updatedRevenue.source}`);
    return updatedRevenue;
  }

  async deleteRevenue(currentUser: CurrentUser, id: string) {
    const revenue = await this.findRevenueById(currentUser, id);

    if (revenue.status !== 'pending') {
      throw new BadRequestException('Only pending revenues can be deleted');
    }

    await this.prisma.revenue.delete({
      where: { id },
    });

    this.logger.log(`Revenue deleted: ${revenue.source}`);
    return { message: 'Revenue deleted successfully' };
  }

  // Financial Summary
  async getFinancialSummary(currentUser: CurrentUser, month?: number, year?: number) {
    const now = new Date();
    const queryMonth = month || now.getMonth() + 1;
    const queryYear = year || now.getFullYear();

    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 1);

    const [totalExpenses, totalRevenues, totalBudget] = await Promise.all([
      this.prisma.expense.aggregate({
        where: {
          companyId: currentUser.companyId,
          expenseDate: { gte: startDate, lt: endDate },
          status: 'paid',
        },
        _sum: { amount: true },
      }),
      this.prisma.revenue.aggregate({
        where: {
          companyId: currentUser.companyId,
          revenueDate: { gte: startDate, lt: endDate },
          status: 'received',
        },
        _sum: { amount: true },
      }),
      this.prisma.budget.aggregate({
        where: {
          companyId: currentUser.companyId,
          month: queryMonth,
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      period: `${queryMonth}/${queryYear}`,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalRevenues: totalRevenues._sum.amount || 0,
      totalBudget: totalBudget._sum.amount || 0,
      netProfit:
        (totalRevenues._sum.amount || 0) - (totalExpenses._sum.amount || 0),
    };
  }
}
