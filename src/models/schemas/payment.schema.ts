import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, Types } from 'mongoose';
import { FeeTypes } from 'src/common/enums/fee-types.enums';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { applyDefaultToJSON } from 'src/utils/schema-transformer.utils';
import { StudentProfile } from './student-profile.schema';
import { MassMovement } from './mass-movement.schema';
import { Hostel } from './hostel.schema';

@Schema({ timestamps: true }) 
export class Payment extends Document {

  @Prop({ type: Types.ObjectId, ref: StudentProfile.name, required: true })
  studentProfileId: Types.ObjectId;  

  @Prop({ 
    type: String, 
    required: true, 
    enum: FeeTypes, 
    default: FeeTypes.OTHER 
  })
  type: string; 

  @Prop({ type: Number, required: true, min: 0 })
  amount: number; 

  @Prop({ type: Date, required: true })
  dueDate: Date; 

  @Prop({ 
    type: String, 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  status: string; 

  @Prop({
    type: String,
    match: [/^(0[1-9]|1[0-2])-(19|20)\d{2}$/, 'Invalid month format. Use MM-YYYY'],
  })
  feeMonth?: string; // Example: "10-2025" for October 2025

  @Prop({ type: String })
  description?: string; 

  @Prop({type: Types.ObjectId, ref: MassMovement.name}) 
  massMovement: MassMovement;

  @Prop({type: Types.ObjectId, ref: Hostel.name})
  hostel: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
export type PaymentDocument = Payment & Document;
applyDefaultToJSON(PaymentSchema)