import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateStudentProfileDto } from 'src/models/dtos/create-student-profile.dto';
import { StudentService } from 'src/models/services/student/student.service';

@Controller('students')
export class StudentsController {
    
    constructor(@Inject(StudentService) private readonly studentService: StudentService) {}

    @Get()
    getAllStudentProfile() {
        return this.studentService.getAllStudentProfile()
    }

    @Get('hostel/:hostelId')
    getAllHostelStudentsProfile(@Param('hostelId') hostelId: string) {
        return this.studentService.getAllHostelStudentsProfile(hostelId);
    }

    @Get(':studentProfileId')
    getStudentProfileById(@Param('studentProfileId') id:string) {
        return this.studentService.getStudentProfileById(id);
    }

    // this endpoint is not needed because 
    // we have already have a profile, when the admin
    // - register us throught the mass register or single register
    @Post()
    createStudentProfile(@Body() body: CreateStudentProfileDto) {
        return this.studentService.createStudentProfile(body);
    }   

    @Patch(':studentProfileId')
    updateStudentProfile(@Param('studentProfileId') id:string,@Body() body: Partial<CreateStudentProfileDto>) {
        return this.studentService.updateStudentProfile(id,body);
    }

    @Delete(':studentProfileId') 
    deleteStudentProfile(@Param('studentProfileId') id:string) {
        return this.studentService.deleteStudentProfile(id);
    }


}
