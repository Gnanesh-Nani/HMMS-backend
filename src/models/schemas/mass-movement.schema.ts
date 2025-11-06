import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Hostel } from "./hostel.schema";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";
@Schema()
export class MassMovement extends Document{
    @Prop({type:[{ type: Types.ObjectId, ref: Hostel.name }], default: []})
    hostels: Hostel[]

    @Prop({ type: Date, default: Date.now }) 
    date: Date
    
    @Prop({type: Boolean, default: false})
    isCompleted: Boolean

}

export const MassMovementSchema = SchemaFactory.createForClass(MassMovement);
export type MassMovementDocument = MassMovement & Document
applyDefaultToJSON(MassMovementSchema)