import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";
import { Conversation } from "./conversation.schema";
import { TicketStatus, TicketTypes } from "src/common/enums/ticket.enum";

@Schema()
export class Ticket {
    @Prop({type: Types.ObjectId,ref:Conversation.name})
    studentProfile: string;

    @Prop({type: Types.ObjectId,ref:Conversation.name})
    conversation: Types.ObjectId
    
    @Prop({enum: TicketTypes})
    type: string
    
    @Prop({type: String})
    subject: string;

    @Prop({type:Date ,default: new Date()})
    raisedOn: Date; 

    @Prop()
    closedOn: Date;

    @Prop({ default: TicketStatus.OPEN, enum: TicketStatus })
    status: string;
}

export type TicketDocument = Ticket & Document
export const TicketSchema = SchemaFactory.createForClass(Ticket)
applyDefaultToJSON(TicketSchema)