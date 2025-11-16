import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { TicketTypes } from "src/common/enums/ticket.enum";

export class CreateTicketDto {
    
    @IsNotEmpty()
    @IsMongoId()
    studentProfile: string;

    @IsNotEmpty()
    @IsEnum(TicketTypes)
    type: string

    @IsNotEmpty()
    @IsString()
    subject: string;
    
    @IsNotEmpty()
    @IsString()
    firstMessage: string

}