import { IsNotEmpty, IsString } from "class-validator";

export class CreateHostelDto {
    @IsString()
    @IsNotEmpty()
    name:string;
    
    @IsString()
    @IsNotEmpty()
    type:string;
    
    @IsString()
    @IsNotEmpty()
    warden:string;

    @IsString()
    @IsNotEmpty()
    desciption:string;

    @IsString()
    @IsNotEmpty()
    mealPlan:string;
}