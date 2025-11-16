import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";
import { MealPlan } from "./meal-plan.schema";

export type HostelDocument = Hostel & Document


export enum HostelGenderType {
    BOYS = 'boys',
    GIRLS = 'girls'
}

@Schema() 
export class Hostel extends Document{
    @Prop({required: true})
    name:string;

    @Prop({required: true,enum: HostelGenderType})
    type:string;
    
    @Prop({default:0})
    totalBlocks: number;

    @Prop({required: true})
    warden: string;

    @Prop({required: true})
    description:string;
    
    @Prop({type:mongoose.Schema.Types.ObjectId,ref: MealPlan.name ,required:true})
    mealPlan: MealPlan

    @Prop({default: 0})
    hostelFee: number;
}

export const HostelSchema = SchemaFactory.createForClass(Hostel)

applyDefaultToJSON(HostelSchema)