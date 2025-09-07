import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true , unique: true})
  registorNo: string;

  @Prop()
  password: string;

  @Prop({ required: true, enum: ['admin', 'student'], default: 'student' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
