import { ArrayNotEmpty, IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { GENDERS } from "../schemas/student-profile.schema";
import { Departments } from "src/common/enums/departments.enum";
import { Transform, Type } from "class-transformer";
import { Years } from "src/common/enums/years.enums";

export class CreateStudentProfileDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    name:string;

    @IsEnum(GENDERS)
    @IsNotEmpty()
    gender: string;

    @IsEnum(Departments)
    @Transform(({ value }) => value?.toLowerCase())
    department: string;

    @IsEnum(Years)
    @IsNotEmpty()
    year: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'dob must be a valid date' })
    dob?: Date;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    contacts?: string[];

    @IsOptional()
    @IsString()
    fathersName?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    mailId?: string;
}