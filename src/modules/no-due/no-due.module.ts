import { Module } from '@nestjs/common';
import { NoDueController } from './no-due.controller';
import { NoDueService } from 'src/models/services/no-due.service';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  providers: [NoDueService],
  controllers: [NoDueController]
})
export class NoDueModule {}
