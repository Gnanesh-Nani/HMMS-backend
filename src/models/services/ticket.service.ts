import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Ticket, TicketDocument } from "../schemas/ticket.schema";
import mongoose, { Model } from "mongoose";
import { Conversation, ConversationDocument } from "../schemas/conversation.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";
import { CreateTicketDto } from "../dtos/create-ticket.dto";
import { TicketStatus } from "src/common/enums/ticket.enum";
import { setEnvironmentData } from "worker_threads";

@Injectable()
export class TicketService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Ticket.name) private readonly ticketModel: Model<TicketDocument>,
        @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>
    ) { }

    async getAllTickets() {
        const tickets = await this.ticketModel.find();
        if (tickets.length == 0)
            return handleError("No tickets were found");
        return handleResponse(tickets, "Tickets Retrived Sucessfully");
    }

    async getTicketById(ticketId: string) {
        const ticket = await this.ticketModel.findById(ticketId).populate('conversation');
        if (!ticket)
            return handleError("No ticket is found for the give Id");
        return handleResponse(ticket, "Ticket Retrived Sucessfully");
    }

    async createTicket(createTicketDto: CreateTicketDto) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const { firstMessage, ...ticketData } = { ...createTicketDto };
            const conversation = new this.conversationModel();
            const savedConversation = await conversation.save({session}); 
            const ticket = new this.ticketModel({ conversation: savedConversation.id , ...ticketData});
            await this.sendMessage(createTicketDto.studentProfile,conversation.id,firstMessage);
            const savedTicket = await ticket.save({session});
            await session.commitTransaction();
            return handleResponse(savedTicket, "Ticked Created Sucessfully");
        } catch (err) {
            session.abortTransaction();
            return handleError(err.message);
        } finally {
            session.endSession()
        }
    }

    async closeTicket(ticketId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const ticket = await this.ticketModel.findById(ticketId)
            if (!ticket)
                return handleError("No ticket found for this Id");
            if (ticket.status == TicketStatus.CLOSED)
                return handleError("This ticket is already closed");
            await this.ticketModel.findByIdAndUpdate(ticketId,{$set:{status: TicketStatus.CLOSED}});
            await session.commitTransaction();
            return handleResponse("Ticket Closed Successfully");
        } catch (err) {
            session.abortTransaction();
            return handleError(err.message)
        } finally {
            session.endSession();
        }
    }

    async sendMessage(senderId: string, conversationId: string, message: string) {
        const session = await this.connection.startSession();
        session.startTransaction()
        try {
            const convo = await this.conversationModel.findById(conversationId)
            await this.conversationModel.findByIdAndUpdate(conversationId,{$push:{messages:{sender:senderId,text:message}}});
            await session.commitTransaction();
            return handleResponse("Sucessfully send message")
        }catch(err) {
            session.abortTransaction();
            return handleError(err.message)
        } finally {
            session.endSession()
        }
    }
}