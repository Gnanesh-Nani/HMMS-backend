import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { loginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import { changePasswordDto } from '../dtos/change-password.dto';
import { StudentProfile } from '../schemas/student-profile.schema';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfile>
    ) { }

    async login(body: loginDto) {
        const user = await this.userModel.findOne({ registerNo: body.reg_no });
        if (!user) {
            return { error: true, message: 'User not found' };
        }
        const isMatch = await bcrypt.compare(body.password, user.password);
        if (!isMatch) {
            return { error: true, message: 'Invalid credentials' };
        }
        const profile = await this.studentProfileModel.findOne({ user: user._id })
                        .select('name gender department year contacts -_id');
        const safeUser = {
            registerNo: user.registerNo,
            role: user.role,
            isFirstLogin: user.isFirstLogin
        };
        return { error: false, message: 'Login successful', data: { user:safeUser, profile} };
    }

    async changePassword(body: changePasswordDto) {
        const user = await this.userModel.findOne({ registerNo: body.reg_no });
        if (!user) {
            return { error: true, message: 'User not found' };
        }
        const isMatch = await bcrypt.compare(body.oldPassword, user.password);
        if (!isMatch) {
            return { error: true, message: 'Invalid credentials' };
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(body.newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return { error: false, message: 'Password changed successfully', data: {} };
    }
}
