import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type StudentProfileDocument = StudentProfile & Document;

@Schema()
export class StudentProfile {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  year: number;

  @Prop()
  dob: Date;

  @Prop([String])
  contacts: string[];

  @Prop()
  fathersName: string;

  @Prop()
  address: string;

  @Prop()
  mailId: string;
}

export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);