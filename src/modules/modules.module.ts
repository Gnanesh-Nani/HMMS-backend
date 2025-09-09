import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [AuthModule, AdminModule, StudentsModule]
})
export class ModulesModule {}
