import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Payment, PaymentDocument } from "../schemas/payment.schema";
import { Model } from "mongoose";
import { PaymentStatus } from "src/common/enums/payment-status.enum";
import { handleError } from "src/utils/handle-error";
import { randomUUID } from 'crypto';
import { NoDue, NoDueDocument } from "../schemas/no-due.schema";
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { StudentProfile, StudentProfileDocument } from "../schemas/student-profile.schema";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { handleResponse } from "src/utils/response.utils";

@Injectable()
export class NoDueService {
    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(NoDue.name) private readonly noDueModel: Model<NoDueDocument>,
        @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
        private configService: ConfigService
    ) { }

    private async addQRCodeToPDF(doc: any, url: string, x: number, y: number, width: number, height: number): Promise<void> {
        try {

            const QRCode = await import('qrcode');

            const qrCodeDataURL = await QRCode.toDataURL(url, {
                width: width,
                height: height,
                margin: 1,
                color: {
                    dark: '#2c3e50',
                    light: '#FFFFFF'
                }
            });

            doc.image(qrCodeDataURL, x, y, {
                width: width,
                height: height
            });

            doc.rect(x, y, width, height)
                .strokeColor('#bdc3c7')
                .lineWidth(1)
                .stroke();

            doc.fontSize(8)
                .fillColor('#7f8c8d')
                .font('Helvetica')
                .text('Scan to Verify', x, y + height + 5, {
                    width: width,
                    align: 'center'
                });

        } catch (error) {
            console.error('Error generating QR code:', error);

            // Fallback: Draw a placeholder if QR code generation fails
            doc.rect(x, y, width, height)
                .fill('#f8f9fa')
                .strokeColor('#e9ecef')
                .lineWidth(1)
                .stroke();

            doc.fontSize(8)
                .fillColor('#6c757d')
                .font('Helvetica')
                .text('QR Code\nNot Available', x, y + height / 2 - 10, {
                    width: width,
                    align: 'center'
                });
        }
    }

    private async generatePDF(student: StudentProfileDocument, token: string, filePath: string) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4',
                    info: {
                        Title: 'No Due Certificate',
                        Author: 'Hostel & Mess Management System',
                        Subject: `No Due Certificate for ${student.name}`
                    }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Colors
                const primaryColor = '#2c3e50';
                const secondaryColor = '#3498db';
                const accentColor = '#e74c3c';
                const textColor = '#2c3e50';
                const lightGray = '#ecf0f1';

                // Header with background
                doc.rect(0, 0, doc.page.width, 120)
                    .fill(primaryColor);

                // University/Institute Name
                doc.fontSize(24)
                    .fillColor('#ffffff')
                    .font('Helvetica-Bold')
                    .text('HOSTEL & MESS MANAGEMENT SYSTEM', 50, 40, {
                        align: 'center',
                        width: doc.page.width - 100
                    });

                // Subtitle
                doc.fontSize(14)
                    .fillColor('#bdc3c7')
                    .font('Helvetica')
                    .text('Government College Of Technology, Coimbatore', 50, 75, {
                        align: 'center',
                        width: doc.page.width - 100
                    });

                // Main Certificate Title
                doc.fontSize(28)
                    .fillColor(accentColor)
                    .font('Helvetica-Bold')
                    .text('NO DUE CERTIFICATE', 50, 150, {
                        align: 'center',
                        width: doc.page.width - 100
                    });

                // Decorative line
                doc.moveTo(100, 190)
                    .lineTo(doc.page.width - 100, 190)
                    .strokeColor(secondaryColor)
                    .lineWidth(2)
                    .stroke();

                // Certificate Content Box
                const contentStartY = 220;
                const contentWidth = doc.page.width - 100;

                // Background for content
                doc.roundedRect(50, contentStartY, contentWidth, 200, 10)
                    .fill(lightGray);

                // Student Information Section
                doc.fontSize(16)
                    .fillColor(primaryColor)
                    .font('Helvetica-Bold')
                    .text('STUDENT INFORMATION', 60, contentStartY + 20);

                doc.moveTo(60, contentStartY + 45)
                    .lineTo(doc.page.width - 60, contentStartY + 45)
                    .strokeColor(secondaryColor)
                    .lineWidth(1)
                    .stroke();

                // Student Details
                const detailsStartY = contentStartY + 60;
                doc.fontSize(12)
                    .fillColor(textColor)
                    .font('Helvetica-Bold');

                doc.text('Full Name:', 60, detailsStartY);
                doc.font('Helvetica')
                    .text(student.name, 150, detailsStartY);

                doc.font('Helvetica-Bold')
                    .text('Register No:', 60, detailsStartY + 25);
                doc.font('Helvetica')
                    .text(student.userId.registerNo, 150, detailsStartY + 25);

                doc.font('Helvetica-Bold')
                    .text('Department:', 60, detailsStartY + 50);
                doc.font('Helvetica')
                    .text(student.department, 150, detailsStartY + 50);

                // Certificate Body
                const bodyStartY = contentStartY + 140;
                doc.fontSize(14)
                    .fillColor(primaryColor)
                    .font('Helvetica-Bold')
                    .text('CERTIFICATION', 60, bodyStartY);

                doc.fontSize(11)
                    .fillColor(textColor)
                    .font('Helvetica')
                    .text(
                        'This is to certify that all hostel and mess dues have been cleared by the above student. No outstanding payments are pending at the date of issue.',
                        60, bodyStartY + 25, {
                        width: contentWidth - 20,
                        align: 'justify'
                    }
                    );

                // Issue Date
                const dateY = bodyStartY + 80;
                doc.fontSize(10)
                    .fillColor(primaryColor)
                    .font('Helvetica-Bold')
                    .text('Date of Issue:', 60, dateY);
                doc.font('Helvetica')
                    .text(new Date().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }), 140, dateY);

                // Certificate ID
                doc.text('Certificate ID:', 300, dateY);
                doc.text(token.slice(0, 8).toUpperCase(), 380, dateY);

                // Verification Section
                const verifyY = dateY + 40;
                doc.fontSize(12)
                    .fillColor(accentColor)
                    .font('Helvetica-Bold')
                    .text('VERIFICATION DETAILS:', 60, verifyY);

                doc.fontSize(10)
                    .fillColor(textColor)
                    .font('Helvetica')
                    .text('This certificate can be verified online using the following link:', 60, verifyY + 20);

                const verificationUrl = `${this.configService.get<string>("VITE_FRONTEND_URL")}/verify/no-due/${token}`;

                doc.fillColor(secondaryColor)
                    .text(verificationUrl, 60, verifyY + 40, {
                        link: verificationUrl,
                        underline: true
                    });

                // Add QR Code
                await this.addQRCodeToPDF(doc, verificationUrl, doc.page.width - 120, verifyY, 60, 60);

                // Footer with only certificate note (no signatures)
                const footerY = doc.page.height - 75;

                doc.moveTo(50, footerY)
                    .lineTo(doc.page.width - 50, footerY)
                    .strokeColor(primaryColor)
                    .lineWidth(1)
                    .stroke();

                // Certificate note
                doc.fontSize(9)
                    .fillColor('#7f8c8d')
                    .font('Helvetica')
                    .text('This is a system-generated certificate and does not require physical signatures.', 50, footerY + 10, {
                        align: 'center',
                        width: doc.page.width - 100
                    });

                doc.end();

                stream.on('finish', () => resolve());
                stream.on('error', (error) => reject(error));

            } catch (error) {
                reject(error);
            }
        });
    }
    async generateNoDue(studentProfileId: string, res: Response, body: any) {
        const pendingPayments = await this.paymentModel.find({
            studentProfileId,
            status: { $ne: PaymentStatus.SUCCESS }
        });

        if (pendingPayments.length > 0) {
            return handleError("You have some pending payments, Please Complete it and generate no Due form");
        }

        const token = randomUUID();

        const studentProfile = await this.studentProfileModel.findById(studentProfileId).populate({
            path: 'userId',
            select: 'registerNo'
        });
        if (!studentProfile)
            return handleError("Student Profile Not Found");

        const fileName = `no_due_${studentProfile.name}_${Date.now()}.pdf`;

        const now = new Date();
        const noDueRecord = new this.noDueModel({
            studentProfile: studentProfileId,
            verificationToken: token,
            purpose: body.purpose,
            generatedAt: now,
            validTill: new Date(now.getFullYear(), now.getMonth() + 1, 0), //end of the current month
            fileName
        });
        await noDueRecord.save();

        const filePath = path.join(process.cwd(), 'src', 'no-due', fileName);

        await this.generatePDF(studentProfile, token, filePath);

        return res.download(filePath, fileName);
    }

    async verifyNoDue(token: string) {
        const noDueRecord: any = await this.noDueModel.findOne({
            verificationToken: token
        }).populate({
            path: 'studentProfile',
            populate: {
                path: 'userId',
                select: 'registerNo'
            }
        });

        if (!noDueRecord) {
            return handleError("Certificate Not Found !");
        }

        let isValid = true;
        let message = "Certificate is Valid";
        const currentDate = new Date();
        if (currentDate > noDueRecord.validTill) {
            isValid = false;
            message = "Certificate is Expired"
        }

        return handleResponse({
            isValid,
            certificate: {
                studentName: noDueRecord.studentProfile.name,
                registerNo: noDueRecord.studentProfile.userId.registerNo,
                department: noDueRecord.studentProfile.department,
                purpose: noDueRecord.purpose,
                generatedAt: noDueRecord.generatedAt,
                validTill: noDueRecord.validTill,
                certificateId: token.slice(0, 8).toUpperCase()
            }
        }, message);
    }
}