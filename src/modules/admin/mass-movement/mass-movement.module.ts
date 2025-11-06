import { Module } from '@nestjs/common';
import { MassMovementController } from './mass-movement.controller';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  providers: [],
  controllers: [MassMovementController]
})
export class MassMovementModule {}
