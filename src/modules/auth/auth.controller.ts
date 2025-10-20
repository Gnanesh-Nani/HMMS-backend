import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from 'src/models/services/auth.service';
import { loginDto } from 'src/models/dtos/login.dto';
import { changePasswordDto } from 'src/models/dtos/change-password.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: loginDto,@Res({passthrough:true}) res:Response) {
    return this.authService.login(body,res);
  }

  @Post('change-password')
  async changePassword(@Body() body: changePasswordDto) {
    return this.authService.changePassword(body);
  }
}
