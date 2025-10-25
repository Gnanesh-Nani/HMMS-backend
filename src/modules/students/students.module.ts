import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { ModelsModule } from 'src/models/models.module';
import { StudentService } from 'src/models/services/student/student.service';

@Module({
  imports: [ModelsModule],
  controllers: [StudentsController],
  providers: [StudentService]
})
export class StudentsModule {}
