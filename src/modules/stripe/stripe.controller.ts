import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { StripeService } from '../../models/services/stripe.service';
import { StripeCheckoutDto } from 'src/models/dtos/stripe-checkout-dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) { }

  @Post('checkout')
  async checkout(@Body() body: StripeCheckoutDto) {
    return await this.stripeService.createCheckoutSession(
      body.studentId,
      body.paymentId,
    );
  }

  @Get('success/:sessionId')
  async handleSuccess(@Param('sessionId') sessionId: string) {
    return await this.stripeService.verifyAndMarkPaymentSuccess(sessionId);
  }

  @Get('failed/:sessionId')
  async handleFailed(@Param('sessionId') sessionId: string) {
    return await this.stripeService.verifyAndMarkPaymentFailed(sessionId);
  }
}
