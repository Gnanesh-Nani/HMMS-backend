import { IsArray, IsNotEmpty } from "class-validator";

export class CreateMassMovementDto {
    @IsArray()
    @IsNotEmpty()
    hostels: string[];
}