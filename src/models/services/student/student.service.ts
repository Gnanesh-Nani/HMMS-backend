import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateStudentPreferenceDto } from "src/models/dtos/create-student-preference.dto";
import { CreateStudentProfileDto } from "src/models/dtos/create-student-profile.dto";
import { StudentPreference, StudentPreferenceDocument } from "src/models/schemas/student-preference.schema";
import { StudentProfile, StudentProfileDocument } from "src/models/schemas/student-profile.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";
import { Types } from "mongoose";

@Injectable()
export class StudentService {
    constructor(
        @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
        @InjectModel(StudentPreference.name) private readonly studentPreferenceModel: Model<StudentPreferenceDocument>
    ){}

    async getStudentPreferenceById(studentProfileId: string) {
        const studentPreference = await this.studentPreferenceModel.findOne({studentProfileId});
        if(!studentPreference)
            return handleError("No student preference found for this studetnProfileId");
        return handleResponse(studentPreference,"Sucessfully retrived student preferenec");
    }

    async createStudentPreference(dto: CreateStudentPreferenceDto) {
        const studentExists = await this.studentProfileModel.exists({ _id: dto.studentProfileId });
        if (!studentExists) {
            return handleError(`Student profile with ID ${dto.studentProfileId} not found`);
        }
        const isPreferenceExists = await this.studentPreferenceModel.exists({studentProfileId: dto.studentProfileId})
        if(isPreferenceExists)
            return handleError("Student Preference already exist for this studetn Profile!");
        
        const studentPreference = new this.studentPreferenceModel(dto);
        await studentPreference.save();

        return handleResponse(studentPreference, "Successfully created student preference");

    }

    async updateStudentPreference(studentProfileId: string, dto: Partial<CreateStudentPreferenceDto>) {
            if (!Types.ObjectId.isValid(studentProfileId)) {
                return handleError("Invalid studentProfileId");
            }

            const updatedPreference = await this.studentPreferenceModel.findOneAndUpdate(
                { studentProfileId },
                { $set: dto },
                { new: true } 
            );

            if (!updatedPreference) {
                return handleError(`No student preference found for studentProfileId ${studentProfileId}`);
            }

            return handleResponse(updatedPreference, "Successfully updated student preference");
    }

    async getAllStudentProfile() {
        const studentProfiles = await this.studentProfileModel.find();
        if(studentProfiles.length == 0)
            return handleError("No students Profile Data Found");

        return handleResponse(studentProfiles,"Successfully Retrived the Students Profile Data");
    }

    async getAllHostelStudentsProfile(hostelId: string) {
        const studentProfiles = await this.studentProfileModel.find({hostel:hostelId});
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