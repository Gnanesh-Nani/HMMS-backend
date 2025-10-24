import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { MailService } from './mail.service';
import { StudentProfile } from '../schemas/student-profile.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { handleError } from 'src/utils/handle-error';
import { handleResponse } from 'src/utils/response.utils';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

interface OtpStore {
  [key: string]: { otp: string; expiresAt: number };
}

@Injectable()
export class OtpService {

  constructor(
    @Inject(MailService) private mailService: MailService,
    @InjectModel(StudentProfile.name) private studentProfileModel: Model<StudentProfile>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ){}
  private otpStore: OtpStore = {};

  async sendOtp(studentProfileId: string) {
    const studentProfile = await this.studentProfileModel.findById(studentProfileId);
    if(!studentProfile)
        return handleError("No Student PRofle for this ID");
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.otpStore[studentProfileId] = { otp, expiresAt };

    try {
        await this.mailService.sendOtpMail(studentProfile.mailId, otp, studentProfile.name);
        return handleResponse({},"Otp Send Sucessfully");
    } catch (error) {
        console.error(error);
        return handleError("Failed to Send Otp");
    }
    
  }

  // Verify OTP
  async verifyOtp(studentProfileId: string, otp: string) {
    const record = this.otpStore[studentProfileId];

    if (!record) {
        return handleError("No OTP found for this user");
    }

    if (Date.now() > record.expiresAt) {
        delete this.otpStore[studentProfileId];
        return handleError("Otp Expired");
    }

    if (record.otp !== otp) {
        return handleError("Invalid Otp");
    }

    // delete this.otpStore[studentProfileId]; 
    return handleResponse({},"Otp Verified Sucessfully");
  }

  async changePassword(userId: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
        return { error: true, message: 'User not found' };
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    return handleResponse({},"Password Changed Sucessfully");
  }

}
