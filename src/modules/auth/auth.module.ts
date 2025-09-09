import { Module } from '@nestjs/common';
import { AuthService } from '../../models/services/auth.service';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [],
  providers: [AuthService],
})

export class AuthModule {}
