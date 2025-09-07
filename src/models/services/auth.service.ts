import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { loginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserSchema } from 'src/models/schemas/user.schema';
import { changePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async login(body: loginDto) {
        const user = await this.userModel.findOne({ registorNo: body.reg_no });
        if (!user) {
            return { error: true, message: 'User not found' };
        }
        const isMatch = await bcrypt.compare(body.password, user.password);
        if (!isMatch) {
            return { error: true, message: 'Invalid credentials' };
        }
        return { error: false, message: 'Login successful' };
    }

    async register(body: loginDto) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(body.password, salt);
        const newUser = new this.userModel({
            registorNo: body.reg_no,
            password: hashedPassword,
        });
        return await newUser.save();
    }

    async changePassword(body: changePasswordDto) {
        const user = await this.userModel.findOne({ registorNo: body.reg_no });
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
        return { error: false, message: 'Password changed successfully' };
    }
}
