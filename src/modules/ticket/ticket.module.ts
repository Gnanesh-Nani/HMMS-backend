import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { ModelsModule } from 'src/models/models.module';

@Module({
  imports: [ModelsModule],
  controllers: [TicketController]
})
export class TicketModule {}
