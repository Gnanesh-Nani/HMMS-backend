import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HealthCondition } from 'src/common/enums/health-condition.enums';
import { Types } from 'mongoose';
import { StudyHabit } from 'src/common/enums/studyHabit';

export class CreateStudentPreferenceDto {
  @IsNotEmpty()
  @IsMongoId()
  studentProfileId: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({each: true})
  preferredRoommates?: string[] = [];

  @IsString()
  @IsNotEmpty()
  wakeupTime: string; // "08:00:00"

  @IsString()
  @IsNotEmpty()
  sleepTime: string; // "03:00:00"

  @IsEnum(StudyHabit)
  @IsOptional()
  studyHabit?: string;

  @IsEnum(HealthCondition)
  @IsOptional()
  healthCondition?: HealthCondition = HealthCondition.NONE;
}
