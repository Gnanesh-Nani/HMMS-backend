import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateStudentProfileDto } from "src/models/dtos/create-student-profile.dto";
import { StudentProfile, StudentProfileDocument } from "src/models/schemas/student-profile.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";

@Injectable()
export class StudentService {
    constructor(
        @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>
    ){}

    async getAllStudentProfile() {
        const studentProfiles = await this.studentProfileModel.find();
        if(studentProfiles.length == 0)
            return handleError("No students Profile Data Found");

        return handleResponse(studentProfiles,"Successfully Retrived the Students Profile Data");
    }

    async getStudentProfileById(studentProfileId:string){
        const studentProfile = await this.studentProfileModel.findById(studentProfileId);
        if(!studentProfile)
            return handleError("No student Profile Data Found for the given Id");
        return handleResponse(studentProfile,"Successfully Retrived the Student Profile Data");
    }

    async createStudentProfile(createStudentProfileDto:CreateStudentProfileDto) {
        const existingStudentProfile = await this.studentProfileModel.find({userId:createStudentProfileDto.userId});
        if(existingStudentProfile.length == 1)
            return handleError("There a profile already associated with this Id");
        const newStudentProfile = new this.studentProfileModel(createStudentProfileDto);
        const savedStudentProfile = await newStudentProfile.save();
        return handleResponse(savedStudentProfile,"Sucessfully Saved Student Profile Data");
    }

    async updateStudentProfile(studentProfileId:string, updates: Partial<CreateStudentProfileDto>) {
        const existingStudentProfile = await this.studentProfileModel.findById(studentProfileId);
        if(!existingStudentProfile)
            return handleError("No Student Profile Found for the given student Profile Id to update");
        const updatedStudentProfile = await this.studentProfileModel.findByIdAndUpdate(studentProfileId,{$set: updates},{new:true});
        return handleResponse(updatedStudentProfile,"Sucessfully updated Student Profile Data");
    }

    async deleteStudentProfile(studentProfileId:string) {
        const deletedStudentProfile = await this.studentProfileModel.findByIdAndDelete(studentProfileId);
        if(!deletedStudentProfile)
            return handleError("Student Profile Data Not Found to Delete");
        return handleResponse(deletedStudentProfile,"Sucessfully Deleted Student Profile Data");
    }
}