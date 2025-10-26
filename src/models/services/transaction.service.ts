import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schemas/transaction.schema';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { handleError } from 'src/utils/handle-error';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>
  ) {}

  async createTransaction(data: CreateTransactionDto) {
    return await this.transactionModel.create({
      ...data,
      status: PaymentStatus.PENDING,
    });
  }

  async markSuccess(sessionId: string, paymentIntentId: string, paymentMethod: string, receiptUrl: string) {
    const transaction = await this.transactionModel.findOne({
        stripeSessionId: sessionId
    })
    if(!transaction)
      return handleError("No Transaction found with the stripe session id");
    if(transaction.status == PaymentStatus.SUCCESS)
        return handleError("This Transactions is already marked as Sucess")
    await this.paymentModel.findByIdAndUpdate(transaction.paymentId,{$set:{status:PaymentStatus.SUCCESS}})
    return await this.transactionModel.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        status: PaymentStatus.SUCCESS,
        stripePaymentIntentId: paymentIntentId,
        paymentMethod,
        receiptUrl,
      },
      { new: true },
    );
  }

  async markFailed(sessionId: string) {
    return await this.transactionModel.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { status: PaymentStatus.FAILED },
      { new: true },
    );
  }
}
