import { Module } from '@nestjs/common';
import { AuthService } from '../../models/services/auth.service';
import { ModelsModule } from 'src/models/models.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [ModelsModule],
  controllers: [AuthController],
  providers: [AuthService],
})

export class AuthModule {}
