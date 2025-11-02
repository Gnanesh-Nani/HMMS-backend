import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StudentProfile } from './student-profile.schema';
import { applyDefaultToJSON } from 'src/utils/schema-transformer.utils';
@Schema({ timestamps: true })
export class NoDue extends Document {
  @Prop({ type: Types.ObjectId, ref: StudentProfile.name, required: true })
  studentProfile: Types.ObjectId;

  @Prop({ required: true })
  verificationToken: string; 

  @Prop({ required: true })
  generatedAt: Date;

  @Prop({required: true})
  purpose: string;

  @Prop()
  validTill: Date;

  @Prop()
  fileName: string;
}

export const NoDueSchema = SchemaFactory.createForClass(NoDue);
applyDefaultToJSON(NoDueSchema)
export type NoDueDocument = NoDue & Document