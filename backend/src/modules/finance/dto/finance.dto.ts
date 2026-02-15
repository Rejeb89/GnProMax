import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';

// Budget DTOs
export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  fiscalYear: number;

  @IsOptional()
  @IsNumber()
  quarter?: number;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Expense DTOs
export class CreateExpenseDto {
  @IsString()
  category: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  branchId: string;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveExpenseDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Revenue DTOs
export class CreateRevenueDto {
  @IsString()
  source: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsDateString()
  revenueDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  branchId: string;
}

export class UpdateRevenueDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
