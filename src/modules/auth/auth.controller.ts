import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../models/services/auth.service';
import { loginDto } from 'src/models/dtos/login.dto';
import { changePasswordDto } from 'src/models/dtos/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/login')
    login(@Body() body: loginDto) {
        return this.authService.login(body);
    }

    @Post('/signup')
    register(@Body() body: loginDto) {
        return this.authService.register(body);
    }

    @Post('/change-password')
    changePassword(@Body() body: changePasswordDto) {
        return this.authService.changePassword(body);
    }
}
