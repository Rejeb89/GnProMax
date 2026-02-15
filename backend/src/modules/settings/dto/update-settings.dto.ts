import { IsOptional, IsString, IsEmail, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemsPerPage?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enableFeatureX?: boolean;
}
