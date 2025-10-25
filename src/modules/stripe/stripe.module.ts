import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from '../../models/services/stripe.service';
import { StripeController } from './stripe.controller';
import { ModelsModule } from 'src/models/models.module';
import { TransactionsService } from 'src/models/services/transaction.service';

@Module({
  imports: [ConfigModule,ModelsModule],
  providers: [StripeService,TransactionsService],
  controllers: [StripeController],
})
export class StripeModule { }
