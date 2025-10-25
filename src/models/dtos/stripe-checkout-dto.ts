import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class StripeCheckoutDto {
    
    @IsString()
    @IsNotEmpty() 
    studentId: string; 

    @IsString()
    @IsNotEmpty() 
    paymentId: string
}