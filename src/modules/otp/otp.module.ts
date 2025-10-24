import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from 'src/models/services/otp.service';
import { MailService } from 'src/models/services/mail.service';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [OtpController],
  providers: [OtpService,MailService]
})
export class OtpModule {}
