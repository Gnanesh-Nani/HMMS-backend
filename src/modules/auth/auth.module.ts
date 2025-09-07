import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../../models/services/auth.service';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [AuthController],
  providers: [AuthService],
})

export class AuthModule {}
