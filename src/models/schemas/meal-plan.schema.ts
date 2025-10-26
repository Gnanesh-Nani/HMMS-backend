import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { applyDefaultToJSON } from "src/utils/schema-transformer.utils";

export type MealPlanDocument = MealPlan & Document;

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Schema()
export class MealPlan extends Document{

  @Prop({ required: true })
  name: string;  

  @Prop([{
    _id:false,
    day: { type: String, enum: Object.values(DayOfWeek), required: true },
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
  }])
  meals: {
    day: DayOfWeek;
    breakfast: string;
    lunch: string;
    dinner: string;
  }[];
}

export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);
applyDefaultToJSON(MealPlanSchema)
