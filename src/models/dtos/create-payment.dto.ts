import { IsMongoId, IsNotEmpty, IsEnum, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { FeeTypes } from 'src/common/enums/fee-types.enums';

export class CreatePaymentDto {
  @IsMongoId()
  studentProfileId: string;

  @IsEnum(FeeTypes)
  type: FeeTypes;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  feeMonth?: string; // Example: "10-2025" for October 2025

  @IsOptional()
  description?: string;
}
