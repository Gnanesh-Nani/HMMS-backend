import { Controller, Post, Param, Body } from '@nestjs/common';
import { OtpService } from 'src/models/services/otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send-otp/:studentProfileId')
  async sendOtp(
    @Param('studentProfileId') id: string
  ) {
    return this.otpService.sendOtp(id);
  }

  @Post('verify-otp/:studentProfileId')
  async verifyOtp(
    @Param('studentProfileId') id: string,
    @Body('otp') otp: string,
  ) {
    return this.otpService.verifyOtp(id, otp);
  }
}
