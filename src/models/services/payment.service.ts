import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Payment, PaymentDocument, PaymentSchema } from "../schemas/payment.schema";
import { Model } from "mongoose";
import { CreatePaymentDto } from "../dtos/create-payment.dto";
import { handleResponse } from "src/utils/response.utils";
import { handleError } from "src/utils/handle-error";
import { PaymentStatus } from "src/common/enums/payment-status.enum";

@Injectable()
export class PaymentService {
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>;

    async allocatePayment(dto: CreatePaymentDto) {
        const payment = new this.paymentModel(dto);
        const savedPayment = await payment.save();
        if(!savedPayment) {
            return handleError('Failed to allocate payment');
        }
        return handleResponse(savedPayment, 'Payment allocated successfully');
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
}