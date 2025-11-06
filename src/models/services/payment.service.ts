import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Payment, PaymentDocument, PaymentSchema } from "../schemas/payment.schema";
import { ClientSession, Model } from "mongoose";
import { BulkPaymentDto, CreatePaymentDto } from "../dtos/create-payment.dto";
import { handleResponse } from "src/utils/response.utils";
import { handleError } from "src/utils/handle-error";
import { PaymentStatus } from "src/common/enums/payment-status.enum";
import { StudentProfile, StudentProfileDocument } from "../schemas/student-profile.schema";

@Injectable()
export class PaymentService {
    constructor (
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>
    ){}

    async allocatePayment(dto: CreatePaymentDto, session?: ClientSession) {
        const studentProfile = await this.studentProfileModel.findById(dto.studentProfileId, null, { session });
        if (!studentProfile)
            throw new Error('Invalid Student Profile Id');

        const payment = new this.paymentModel(dto);
        const savedPayment = await payment.save({ session });

        if (!savedPayment)
            throw new Error('Failed to allocate payment');

        return { data: savedPayment, message: 'Payment allocated successfully' };
    }


    async updatePayment(paymentId: string, dto: Partial<CreatePaymentDto>) {
        const updatedPayment = await this.paymentModel.findByIdAndUpdate(paymentId, dto, { new: true });
        if(!updatedPayment) {
            return handleError('Failed to update payment');
        }
        if(updatedPayment.status == PaymentStatus.SUCCESS)
            return handleError('Failed to update payment, Payment already Done');
        return handleResponse(updatedPayment, 'Payment updated successfully');
    }   

    async deletePayment(paymentId: string) {
        const deletedPayment = await this.paymentModel.findByIdAndDelete(paymentId);
        if(!deletedPayment) {
            return handleError('Failed to delete payment');
        }
        return handleResponse(deletedPayment, 'Payment deleted successfully');
    }

    async getAll() {
        const payments = await this.paymentModel.find()
        .populate({
            path: 'studentProfileId', // the field in Payment that references StudentProfile
            select: 'name gender registerNo department year',       
        });

        if (payments.length === 0) {
            return handleError('No payments found');
        }

        return handleResponse(payments, 'Payments retrieved successfully');
    }


    async getByStudent(studentProfileId: string) {
        const payments = await this.paymentModel.find({ studentProfileId });
        if(payments.length === 0) {
            return handleError('No payments found for this student');
        }
        return handleResponse(payments, 'Student payments retrieved successfully');
    }

    async bulkAllocate(body: BulkPaymentDto) {
        Logger.debug("Bulk Payment Called")
        let response : { success: number, failed : {studentProfileId:string ,message:string}[] } = { success: 0, failed: [] }
        for(const payments of body.payments){
             // console.log("paument", payments)
            try {
                await this.allocatePayment(payments);
                response.success++;
                // Logger.debug("Hi");
            } catch (err) {
                response.failed.push({studentProfileId : payments.studentProfileId, message: err.message});
            }
        }
        return handleResponse(response,"payments allocated sucessfully");
    }
}