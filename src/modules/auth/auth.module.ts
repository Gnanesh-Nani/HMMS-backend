import { Module } from '@nestjs/common';
import { AuthService } from '../../models/services/auth.service';
import { ModelsModule } from 'src/models/models.module';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ModelsModule,PassportModule,JwtModule.register({
      secret: "secret-key", 
      signOptions: { expiresIn: '1h'}
  })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})

export class AuthModule {}
