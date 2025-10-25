import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class RegisterSingleDto {
    @IsNotEmpty()
    @IsString()
    registerNo: string;
    
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()   
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @IsNotEmpty()
    @IsString()
    department: string;

    @IsNotEmpty()
    @IsString()
    role: string;
}
