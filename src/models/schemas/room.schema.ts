import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Block } from "./block.schema";
import mongoose, { Document } from "mongoose";
import { StudentProfile } from "./student-profile.schema";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";

export type RoomDocument = Room & Document

@Schema() 
export class Room {
    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Block',required:true})
    blockId: Block

    @Prop({required:true})
    roomNo: number;

    @Prop({required:true})
    maxCapacity: number;

    @Prop({required:true})
    floorNo: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref:StudentProfile.name }], default: [] })
    currentStudents: mongoose.Schema.Types.ObjectId[];

}

export const RoomSchema = SchemaFactory.createForClass(Room)
applyDefaultToJSON(RoomSchema)


