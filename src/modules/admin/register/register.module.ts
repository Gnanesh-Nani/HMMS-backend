import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { ModelsModule } from 'src/models/models.module';
@Module({
  imports:[ModelsModule],
  controllers: [RegisterController]
})
export class RegisterModule {}
