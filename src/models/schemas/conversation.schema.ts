import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";
import { StudentProfile } from "./student-profile.schema";
@Schema({ timestamps: true })
export class Conversation {
    @Prop([{
        sender: { type: Types.ObjectId, ref: StudentProfile.name },
        text: { type: String },
        sentAt: { type: Date, default: Date.now },
        default:[]
    }])
    messages: {
        sender: Types.ObjectId;
        text: string;
        sentAt: Date;
    }[];

}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
applyDefaultToJSON(ConversationSchema);
