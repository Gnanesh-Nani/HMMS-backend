import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/schemas/user.schema';
import { RegisterService } from './services/admin/register.service';
import { StudentProfile,StudentProfileSchema } from './schemas/student-profile.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: StudentProfile.name, schema: StudentProfileSchema }]) 
  ],
  providers: [AuthService,RegisterService],
  exports: [AuthService, 
    MongooseModule,
    RegisterService
  ],
})
export class ModelsModule {}
