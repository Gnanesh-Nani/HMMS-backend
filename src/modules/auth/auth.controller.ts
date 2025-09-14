import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from 'src/models/services/auth.service';
import { loginDto } from 'src/models/dtos/login.dto';
import { changePasswordDto } from 'src/models/dtos/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: loginDto) {
    return this.authService.login(body);
  }

  @Post('change-password')
  async changePassword(@Body() body: changePasswordDto) {
    return this.authService.changePassword(body);
  }
}
