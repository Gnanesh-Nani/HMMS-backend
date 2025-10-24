import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendWelcomeMail(to: string, name: string) {
        await this.mailerService.sendMail({
            to,
            subject: 'Welcome to Hostel Management System',
            template: './welcome',
            context: { name },
        });
    }

    async sendOtpMail(to: string, otp: string, name?: string) {
        await this.mailerService.sendMail({
            to,
            subject: 'Your OTP Code',
            template: './otp', 
            context: {
                name: name || 'User',
                otp,
            },
        });
    }
}