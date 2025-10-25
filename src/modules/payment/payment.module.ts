import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from 'src/models/services/payment.service';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
