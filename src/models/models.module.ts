import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/schemas/user.schema';
import { RegisterService } from './services/admin/register.service';
import { StudentProfile,StudentProfileSchema } from './schemas/student-profile.schema';
import { JwtService } from '@nestjs/jwt';
import { Hostel, HostelSchema } from './schemas/hostel.schema';
import { Block, BlockSchema } from './schemas/block.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { HostelService } from './services/admin/hostel.service';
import { BlockService } from './services/admin/block.service';
import { RoomService } from './services/admin/room.service';
import { MealPlanService } from './services/admin/meal-plan.service';
import { MealPlan, MealPlanSchema } from './schemas/meal-plan.schema';
import { Notification, NotificationSchmea } from './schemas/notification.schema';
import { StudentService } from './services/student/student.service';
import { MailService } from './services/mail.service';
import { OtpService } from './services/otp.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';


@Module({
  imports: [
    MongooseModule.forFeature([ { name: User.name, schema: UserSchema },
                                { name: StudentProfile.name, schema: StudentProfileSchema },
                                { name: Hostel.name, schema: HostelSchema},
                                { name: Block.name, schema: BlockSchema}, 
                                { name: Room.name, schema: RoomSchema},
                                {name: MealPlan.name,schema: MealPlanSchema},
                                {name: Notification.name, schema: NotificationSchmea},
                                {name: Payment.name, schema: PaymentSchema}
                              ]),
  ],
  providers: [AuthService,RegisterService,JwtService,HostelService,BlockService,RoomService,MealPlanService,StudentService,MailService,OtpService],
  exports: [AuthService, 
    MongooseModule,
    RegisterService,
    MailService
  ],
})
export class ModelsModule {}
