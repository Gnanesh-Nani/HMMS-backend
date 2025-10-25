import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { Payment } from './payment.schema';
import { StudentProfile } from './student-profile.schema';
import { applyDefaultToJSON } from 'src/utils/schema-transformer.utils';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true , type: Types.ObjectId, ref: Payment.name})
  paymentId: Payment; 

  @Prop({ required: true , type: Types.ObjectId, ref: StudentProfile.name})
  studentId: StudentProfile;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  stripeSessionId: string;

  @Prop()
  stripePaymentIntentId: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop()
  paymentMethod?: string;

  @Prop()
  receiptUrl?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
applyDefaultToJSON(TransactionSchema);
