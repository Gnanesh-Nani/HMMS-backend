import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schemas/transaction.schema';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { handleError } from 'src/utils/handle-error';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async createTransaction(data: CreateTransactionDto) {
    return await this.transactionModel.create({
      ...data,
      status: PaymentStatus.PENDING,
    });
  }

  async markSuccess(sessionId: string, paymentIntentId: string, paymentMethod: string, receiptUrl: string) {
    const isAlreadySucessTransaction = await this.transactionModel.findOne({
        stripeSessionId: sessionId,
        status: PaymentStatus.SUCCESS
    })
    if(isAlreadySucessTransaction)
        return handleError("This Transactions is already marked as Sucess")
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
