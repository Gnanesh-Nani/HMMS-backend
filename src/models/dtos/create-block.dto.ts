import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBlockDto {
    @IsString()
    @IsNotEmpty()
    name:string;

    @IsNumber()
    @IsNotEmpty()
    totalFloors: number;
    
}