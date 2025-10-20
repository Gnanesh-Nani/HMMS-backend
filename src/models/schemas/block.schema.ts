import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Hostel } from "./hostel.schema";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";

export type BlockDocument = Block & Document

@Schema()
export class Block {
    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Hostel',required: true})
    hostelId: Hostel

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    totalFloors: number;
    
}

export const BlockSchema = SchemaFactory.createForClass(Block)
applyDefaultToJSON(BlockSchema)