import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';

@Module({
  controllers: [],
  imports: [RegisterModule]
})
export class AdminModule {}
