import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { loginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/models/schemas/user.schema';
import { changePasswordDto } from '../dtos/change-password.dto';
import { StudentProfile } from '../schemas/student-profile.schema';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfile>,
        private jwtService: JwtService,
        private configService:ConfigService
    ) { }

    async login(body: loginDto,res: Response) {
        const user = await this.userModel.findOne({ registerNo: body.reg_no });
        if (!user) {
            return { error: true, message: 'User not found' };
        }
        const isMatch = await bcrypt.compare(body.password, user.password);
        if (!isMatch) {
            return { error: true, message: 'Invalid credentials' };
        }
        const profile = await this.studentProfileModel.findOne({ userId: user._id })
                        // .select('name gender department year contacts -_id');
        
        const payload = {sub: user._id, registerNo: user.registerNo , role: user.role}

        const accessToken = this.jwtService.sign(payload,{
            secret: this.configService.get('JWT_SECRET_KEY'),
            expiresIn:this.configService.get('JWT_EXPIRATION_TIME')
        })

        res.setHeader('Set-Cookie', `jwt=${accessToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`);

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
