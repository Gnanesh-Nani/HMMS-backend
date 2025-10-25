import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { ModelsModule } from 'src/models/models.module';
import { NotificationService } from 'src/models/services/admin/notifications.service';

@Module({
  imports: [ModelsModule],
  providers: [NotificationService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
