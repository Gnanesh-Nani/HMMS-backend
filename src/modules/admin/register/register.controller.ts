import { Body, Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterSingleDto } from 'src/models/dtos/register-single.dto';
import { RegisterService } from 'src/models/services/admin/register.service';

@Controller('admin/register')
export class RegisterController {

    constructor(
        @Inject(RegisterService) private registerService: RegisterService
    ) {} 

    @Post()
    async registerSingle(@Body() body:RegisterSingleDto) {
        return this.registerService.registerSingle(body);
    }

    @Post('bulk')
    @UseInterceptors(FileInterceptor('file'))
    async registerBulk(@UploadedFile() file: Express.Multer.File) {
        return this.registerService.registerBulk(file);
    }
}
