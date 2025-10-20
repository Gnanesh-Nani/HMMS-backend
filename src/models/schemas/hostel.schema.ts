import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";

export type HostelDocument = Hostel & Document

@Schema() 
export class Hostel {
    @Prop({required: true})
    name:string;

    @Prop({required: true,enum: ['boys','girls']})
    type:string;
    
    @Prop({default:0})
    totalBlocks: number;

    @Prop({required: true})
    warden: string;

    @Prop({required: true})
    description:string;
    
}

export const HostelSchema = SchemaFactory.createForClass(Hostel)

applyDefaultToJSON(HostelSchema)