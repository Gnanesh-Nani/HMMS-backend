import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';
import { applyDefaultToJSON } from 'src/utils/schema-transformer.utils';
import { Hostel } from './hostel.schema';

export type StudentProfileDocument = StudentProfile & Document;

export enum GENDERS {
  MALE  = 'male',
  FEMAL = 'female'
}

@Schema()
export class StudentProfile {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name , required: true })
  userId: User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: GENDERS })
  gender: string;

  @Prop({default: null})
  department: string;

  @Prop({default:0})
  year: number;

  @Prop({ type: Date, default: null})
  dob: Date;

  @Prop([String])
  contacts: string[];

  @Prop({default: null})
  fathersName: string;

  @Prop({default: null})
  address: string;

  @Prop({default: null})
  mailId: string;
  
  @Prop({type: Types.ObjectId, ref: Hostel.name})
  hostel: Hostel;

  @Prop({ default: false})
  physicallyChallenged: Boolean; 
  
  @Prop({default: null})
  registerNo:string;

  @Prop({default: false})
  passOut: boolean;
}

export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);
applyDefaultToJSON(StudentProfileSchema)