import { IsNotEmpty, IsString, IsNumber, IsEmail, IsEnum, IsBoolean } from "class-validator";
import { Years } from "src/common/enums/years.enums";

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
    @IsEnum(Years)
    year: number;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @IsNotEmpty()
    @IsString()
    department: string;

    @IsEmail()
    @IsString()
    mailId:string;

    @IsBoolean()
    physicallyChallenged: boolean;
}
