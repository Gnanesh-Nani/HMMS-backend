import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateNotificationDto } from "src/models/dtos/create-notification.dto";
import { Notification, NotificationDocument, NotificationType } from "src/models/schemas/notification.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>
    ){}

    async getAllNotificaiton(){
        const notifications = await this.notificationModel.find({
            type: {
                $in:[NotificationType.GLOBAL
                    ,NotificationType.GENDER
                    ,NotificationType.HOSTEL]
            }});

        if(notifications.length == 0)
            return handleError("No Notifications Found");

        return handleResponse(notifications,"Notifications Retrived Sucessfully");

    }
    async getNotificationById(notificationId:string) {
        const notification  = await this.notificationModel.findById(notificationId);
        if(!notification)
            return handleError("No notifications found for the given Id");

        return handleResponse(notification,"Notification Retrived Sucessfully");
    }

    async createNotification(createNotficationDto:CreateNotificationDto) {
        if(createNotficationDto.type === NotificationType.PERSONAL)
            return handleError("You Can't add a personal Notificaitons");

        const notification = new this.notificationModel({...createNotficationDto});
        const savedNotification = await notification.save()

        return handleResponse(savedNotification,"Notifications Created Sucessfully");
    }

    async updateNotificaiton(notificationId:string, update: Partial<CreateNotificationDto>) {
        const updateNotificaiton = await this.notificationModel.findByIdAndUpdate(
            notificationId,
            {$set: update},
            {new: true}
        )

        if(!updateNotificaiton) 
            return handleError("No notification found with the given Id");

        return handleResponse(updateNotificaiton,"Notification updated sucessfully");
    }

    async deleteNotification(notificationId: string) {
        const deletedNotification = await this.notificationModel.findByIdAndDelete(notificationId)
        if(!deletedNotification)
            return handleError("No notifications found with the given Id");

        return handleResponse("Notification Deleted Sucessfully")
    }
}