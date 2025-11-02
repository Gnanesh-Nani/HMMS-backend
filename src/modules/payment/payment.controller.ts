import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import { Role } from 'src/common/decorators/roles.decorator';
import { BulkPaymentDto, CreatePaymentDto } from 'src/models/dtos/create-payment.dto';
import { PaymentService } from 'src/models/services/payment.service';

@Controller('payment')
export class PaymentController {
    constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}
    
    @Post('allocate')
    //@Role('admin')
    async allocatePayment(@Body() dto: CreatePaymentDto) {
        return this.paymentService.allocatePayment(dto);
    }


    @Patch('update/:paymentId')
    //@Role('admin')
    async updatePayment(@Param('paymentId') paymentId:string,@Body() dto: Partial<CreatePaymentDto>) {
        return this.paymentService.updatePayment(paymentId, dto);
    }

    @Delete('delete/:paymentId')
    //@Role('admin')
    async deletePayment(@Param('paymentId') paymentId:string) {
        return this.paymentService.deletePayment(paymentId);
    }

    @Get()
    //@Role('admin')
    async getAllPayments() {
        return this.paymentService.getAll();
    }

    @Get(':studentProfileId')
    //@Role('student')
    async getMyPayments(@Param('studentProfileId') studentProfileId: string) {
        return this.paymentService.getByStudent(studentProfileId);
    }

    @Post('/bulk-allocate')
    async bulkAllocate(@Param('hostelId') hostelId: string , @Body() body: BulkPaymentDto){
        return this.paymentService.bulkAllocate(body); 
    }
}
