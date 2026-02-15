import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ApproveExpenseDto,
  CreateRevenueDto,
  UpdateRevenueDto,
} from './dto/finance.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchGuard } from '@common/guards/branch.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // Budget Endpoints
  @Post('budgets')
  @RequirePermissions('finance.create')
  createBudget(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.financeService.createBudget(currentUser, createBudgetDto);
  }

  @Get('budgets')
  @RequirePermissions('finance.read')
  findBudgets(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.financeService.findBudgets(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get('budgets/:id')
  @RequirePermissions('finance.read')
  findBudgetById(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.financeService.findBudgetById(currentUser, id);
  }

  @Put('budgets/:id')
  @RequirePermissions('finance.update')
  updateBudget(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.financeService.updateBudget(currentUser, id, updateBudgetDto);
  }

  @Delete('budgets/:id')
  @RequirePermissions('finance.delete')
  deleteBudget(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteBudget(currentUser, id);
  }

  // Expense Endpoints
  @Post('expenses')
  @RequirePermissions('finance.create')
  createExpense(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.financeService.createExpense(currentUser, createExpenseDto);
  }

  @Get('expenses')
  @RequirePermissions('finance.read')
  findExpenses(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.financeService.findExpenses(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get('expenses/:id')
  @RequirePermissions('finance.read')
  findExpenseById(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.financeService.findExpenseById(currentUser, id);
  }

  @Put('expenses/:id')
  @RequirePermissions('finance.update')
  updateExpense(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.financeService.updateExpense(currentUser, id, updateExpenseDto);
  }

  @Post('expenses/:id/approve')
  @RequirePermissions('finance.update')
  approveExpense(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() approveExpenseDto: ApproveExpenseDto,
  ) {
    return this.financeService.approveExpense(currentUser, id, approveExpenseDto);
  }

  @Delete('expenses/:id')
  @RequirePermissions('finance.delete')
  deleteExpense(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteExpense(currentUser, id);
  }

  // Revenue Endpoints
  @Post('revenues')
  @RequirePermissions('finance.create')
  createRevenue(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createRevenueDto: CreateRevenueDto,
  ) {
    return this.financeService.createRevenue(currentUser, createRevenueDto);
  }

  @Get('revenues')
  @RequirePermissions('finance.read')
  findRevenues(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.financeService.findRevenues(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get('revenues/:id')
  @RequirePermissions('finance.read')
  findRevenueById(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.financeService.findRevenueById(currentUser, id);
  }

  @Put('revenues/:id')
  @RequirePermissions('finance.update')
  updateRevenue(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateRevenueDto: UpdateRevenueDto,
  ) {
    return this.financeService.updateRevenue(currentUser, id, updateRevenueDto);
  }

  @Delete('revenues/:id')
  @RequirePermissions('finance.delete')
  deleteRevenue(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteRevenue(currentUser, id);
  }

  // Summary
  @Get('summary')
  @RequirePermissions('finance.read')
  getFinancialSummary(
    @CurrentUser() currentUser: CurrentUser,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.financeService.getFinancialSummary(
      currentUser,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }
}
