import { IsString, IsOptional, IsDateString, IsNumber, IsDecimal } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  registrationNumber: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  purchasePrice?: number;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  fuelConsumption?: number;

  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsString()
  branchId: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  fuelConsumption?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class AssignDriverDto {
  @IsString()
  driverId: string;
}
