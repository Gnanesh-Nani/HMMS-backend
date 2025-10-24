import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Hostel } from "./hostel.schema";
import { StudentProfile } from "./student-profile.schema";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";

export type NotificationDocument = Notification & Document

export enum NotificationType {
    GLOBAL = 'global',
    GENDER = 'gender',
    HOSTEL = 'hostel',
    PERSONAL = 'personal'
}
@Schema()
export class Notification {
    @Prop({required:true})
    title: string;

    @Prop({required:true})
    message: string;

    @Prop({enum:NotificationType,required:true})
    type: NotificationType

    @Prop({enum:['boys','girls'],required:false})
    gender?:string

    @Prop({type:Types.ObjectId,ref:Hostel.name,required:false})
    hostelId?:Hostel

    @Prop({type:Types.ObjectId,ref:StudentProfile.name,required:false})
    studentProfileId?:StudentProfile

    @Prop({default:false})
    isRead:boolean;

    @Prop({default:Date.now})
    createdAt: Date;
}

export const NotificationSchmea = SchemaFactory.createForClass(Notification)
applyDefaultToJSON(NotificationSchmea)