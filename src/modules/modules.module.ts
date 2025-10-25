import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { StudentsModule } from './students/students.module';
import { MailModule } from './mail/mail.module';
import { PaymentModule } from './payment/payment.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [AuthModule, AdminModule, StudentsModule, MailModule, PaymentModule, StripeModule],
})
export class ModulesModule {}
