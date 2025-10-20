import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { applyDefaultToJSON } from 'src/utils/schema-transformer.utils';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  registerNo: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'student'], default: 'student' })
  role: string;

  @Prop({ default: true })
  isFirstLogin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
applyDefaultToJSON(UserSchema)