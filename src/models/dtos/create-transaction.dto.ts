import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateTransactionDto {
    @IsMongoId()
    @IsNotEmpty()
    paymentId: string;
    studentId: string;

    @IsMongoId()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @IsString()
    stripeSessionId: string;
}