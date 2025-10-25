import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { DayOfWeek } from "../schemas/meal-plan.schema";
import { Type } from "class-transformer";
class MealEntryDto {
    @IsEnum(DayOfWeek,{message:"Day must be one of: monday, tuesday, ... sunday"})
    day: DayOfWeek

    @IsString()
    @IsNotEmpty()
    breakfast: string

    @IsString()
    @IsNotEmpty()
    lunch:string

    @IsString()
    @IsNotEmpty()
    dinner:string
}
export class CreateMealPlanDto {
    @IsString()
    @IsNotEmpty()
    name:string

    @IsArray()
    @ValidateNested({each:true})
    @Type(()=>MealEntryDto) 
    meals:MealEntryDto[]   
}