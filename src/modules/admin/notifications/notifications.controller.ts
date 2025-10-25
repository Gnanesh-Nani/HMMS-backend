import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateNotificationDto } from 'src/models/dtos/create-notification.dto';
import { NotificationService } from 'src/models/services/admin/notifications.service';

@Controller('notifications')
export class NotificationsController {

    constructor(
        @Inject(NotificationService) private readonly notificationService: NotificationService
    ){}

    @Get()
    getAllNotification() {
        return this.notificationService.getAllNotificaiton();
    }

    @Get(':notificationId')
    getNotificationById(@Param('notificationId') id:string){
        return this.notificationService.getNotificationById(id);
    }

    @Post()
    createNotification(@Body() createNotificationDto : CreateNotificationDto) {
        return this.notificationService.createNotification(createNotificationDto);
    }

    @Patch(':notificationId')
    updateNotification(@Param('notificationId') id:string,@Body() body: Partial<CreateNotificationDto>) {
        return this.notificationService.updateNotificaiton(id,body);
    }

    @Delete(':notificationId')
    deleteNotification(@Param('notificationId') id:string) {
        return this.notificationService.deleteNotification(id);
    }
}
