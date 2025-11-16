import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateTicketDto } from 'src/models/dtos/create-ticket.dto';
import { TicketService } from 'src/models/services/ticket.service';

@Controller('ticket')
export class TicketController {
    constructor(
        @Inject() private readonly ticketService: TicketService
    ){}
    @Get()
    getAllTickets() {
        return this.ticketService.getAllTickets();
    }

    @Get(':ticketId')
    getTicketById(@Param('ticketId') ticketId: string) {
        return this.ticketService.getTicketById(ticketId);
    }

    @Post('create') 
    createTicket(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketService.createTicket(createTicketDto);
    }

    @Patch('/close/:ticketId')
    closeTicket(@Param('ticketId') ticketId: string) {
        return this.ticketService.closeTicket(ticketId);
    }

    @Post('/send-message/:conversationId')
    sendMessage(@Param('conversationId') conversationId: string, @Body() messageDto:{senderId:string,message: string}) {
        return this.ticketService.sendMessage(messageDto.senderId,conversationId,messageDto.message);
    }
}
