import { Body, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "src/models/schemas/user.schema";
import { StudentProfile, StudentProfileDocument } from "src/models/schemas/student-profile.schema";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import { RegisterSingleDto } from "src/models/dtos/register-single.dto";
import { UserRoles } from "src/common/enums/roles.enum";

@Injectable()
export class RegisterService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfileDocument>,
    ) { }

    async registerSingle(@Body() body: RegisterSingleDto) {
        const user = await this.userModel.findOne({ registerNo: body.registerNo });
        if (user) {
            return { error: true, message: 'User already exists' };
        }
        const salt = await bcrypt.genSalt();

        const hashedPassword = await bcrypt.hash(body.password, salt);
        const newUser = new this.userModel({
            registerNo: body.registerNo,
            password: hashedPassword,
            role: UserRoles.STUDENT,
        });
        const savedUser = await newUser.save();

        const newStudentProfile = new this.studentProfileModel({
            userId: savedUser._id,
            name: body.name,
            year: body.year,
            gender: body.gender,
            department: body.department,
        });

        await newStudentProfile.save();

        return { error: false, message: 'User registered successfully' };
    }

    async registerSingleAdmin(body:any){
        const user = await this.userModel.findOne({ registerNo: body.registerNo });
        if (user) {
            return { error: true, message: 'User already exists' };
        }
        const salt = await bcrypt.genSalt();

        const hashedPassword = await bcrypt.hash(body.password, salt);
        const newUser = new this.userModel({
            registerNo: body.registerNo,
            password: hashedPassword,
            role: UserRoles.ADMIN,
        });
        const savedUser = await newUser.save();

        const newStudentProfile = new this.studentProfileModel({
            userId: savedUser._id,
            name: body.name,
            gender: body.gender
        });

        await newStudentProfile.save();

        return { error: false, message: 'User registered successfully' };
    }

    async registerBulk(file: Express.Multer.File) {
        const fileContent = file.buffer.toString("utf8");

        const parsed = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
        });

        const rows = parsed.data as Record<string, string>[];

        const result: { success: number, failed : {registerNo:string,message:string}[] } = { success: 0, failed: [] };

        for (const row of rows) {
            const { registerNo, name, password, year, gender, department , mailId} = row;
            try {
                const existing = await this.userModel.findOne({ registerNo: registerNo });
                if (existing) {
                    result.failed.push({registerNo, message: "User already exists"});
                    continue;
                }
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(password, salt);

                const user = new this.userModel({
                    registerNo: registerNo,
                    password: hashedPassword,
                    role: UserRoles.STUDENT
                });
                const savedUser = await user.save();

                const profile = new this.studentProfileModel({
                    userId: savedUser._id,
                    name,
                    gender,
                    department,
                    year: parseInt(year, 10),
                    mailId
                });

                await profile.save();

                result.success++;
            } catch (err) {
                result.failed.push({ registerNo, message: err.message });
            }
        }

        return result;
    }

}