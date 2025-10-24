import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { StudentsModule } from './students/students.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [AuthModule, AdminModule, StudentsModule, MailModule]
})
export class ModulesModule {}
