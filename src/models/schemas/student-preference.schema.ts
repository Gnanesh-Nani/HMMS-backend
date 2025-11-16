import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, Types } from 'mongoose';
import { StudentProfile } from './student-profile.schema';
import { HealthCondition } from 'src/common/enums/health-condition.enums';
import { applyDefaultToJSON } from 'src/utils/schema-transformer.utils';

export type StudentPreferenceDocument = StudentPreference & Document;

@Schema({ timestamps: true })
export class StudentPreference {

  @Prop({type: Types.ObjectId, ref: StudentProfile.name})
  studentProfileId: Types.ObjectId;

  @Prop({required: true,default: []})
  preferredRoommates: string[];

  @Prop({required: true})
  wakeupTime: string; // "08:00:00"

  @Prop({required: true})
  sleepTime: string; // "03:00:00"

  @Prop()
  studyHabit: string;

  @Prop({enum: HealthCondition,default: HealthCondition.NONE})
  healthCondition: string; 
}

export const StudentPreferenceSchema = SchemaFactory.createForClass(StudentPreference);
applyDefaultToJSON(StudentPreferenceSchema)