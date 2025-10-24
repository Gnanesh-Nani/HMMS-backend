import { Body, Controller, HttpCode, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/models/services/auth.service';
import { loginDto } from 'src/models/dtos/login.dto';
import { changePasswordDto } from 'src/models/dtos/change-password.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
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
