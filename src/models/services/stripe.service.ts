import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from './transaction.service';
import { handleResponse } from 'src/utils/response.utils';
import { handleError } from 'src/utils/handle-error';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Model } from 'mongoose';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @Inject(TransactionsService) private transactionsService: TransactionsService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>
  ) 
  {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') ?? "", {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(studentId: string, paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId)
    if(!payment){
      return handleError("Invalid Payment ID");
    }
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card','amazon_pay'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Hostel Fee Payment`,
              description: `Payment for student ID: ${studentId}`,
            },
            unit_amount: payment.amount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('STRIPE_SUCCESS_URL')}?paymentId=${paymentId}&success=true`,
      cancel_url: `${this.configService.get('STRIPE_CANCEL_URL')}paymentId=${paymentId}&success=false`,
      metadata: {
        studentId,
        paymentId,
      },
    });

    await this.transactionsService.createTransaction({
      paymentId,
      studentId,
      amount: payment.amount,
      currency: 'inr',
      stripeSessionId: session.id,
    });

    return handleResponse({ url: session.url, sessionId: session.id },"Sucessfully created Stripe checkout session");
  }

  async verifyAndMarkPaymentSuccess(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (!session.payment_intent) {
      return handleError('No payment intent found for this session');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    )  

    if(paymentIntent.status !== 'succeeded'){
      return handleError("Payment not successful yet");
    }
    const chargeId = paymentIntent.latest_charge;

    const charge = await this.stripe.charges.retrieve(chargeId as string);

    const receiptUrl = charge.receipt_url ?? '';
    const paymentMethod = 'card';

    await this.transactionsService.markSuccess(
      sessionId,
      paymentIntent.id,
      paymentMethod,
      receiptUrl,
    );

    return handleResponse({ receiptUrl },"Payment verified and marked as success");
  }

  async verifyAndMarkPaymentFailed(sessionId: string) {
    await this.transactionsService.markFailed(sessionId);
    return handleResponse(null,"Payment marked as failed");
  }
}
