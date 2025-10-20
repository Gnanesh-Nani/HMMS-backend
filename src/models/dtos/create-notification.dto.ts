import { IsEnum, IsNotEmpty, IsOptional, IsString, IsMongoId } from "class-validator";
import { NotificationType } from "../schemas/notification.schema";
import { HostelGenderType } from "../schemas/hostel.schema";



export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(HostelGenderType)
  @IsOptional()
  gender?: string;

  @IsMongoId()
  @IsOptional()
  hostelId?: string;

  @IsMongoId()
  @IsOptional()
  studentProfileId?: string;
}
