import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateRoomDto{
    @IsNumber()
    @IsNotEmpty()
    roomNo: number

    @IsNumber()
    @IsNotEmpty()
    maxCapacity: number

    @IsNumber()
    @IsNotEmpty()
    floorNo: number
}