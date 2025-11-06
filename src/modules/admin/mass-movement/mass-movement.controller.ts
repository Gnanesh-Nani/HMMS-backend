import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { CreateMassMovementDto } from 'src/models/dtos/create-mass-movement.dto';
import { MassMovementService } from 'src/models/services/admin/mass-movement.service';

@Controller('mass-movement')
export class MassMovementController {
    
    constructor(@Inject(MassMovementService) private massMovementService: MassMovementService) {}

    @Get()
    getMassMovements(){
        return this.massMovementService.getAllMassMovement();
    }

    @Get('payment-status/:massMovementId')
    getMassMovement(@Param('massMovementId')id: string) {
        return this.massMovementService.getPaymentStatusOfMassMovement(id);
    }

    @Post()
    createMassMovement(@Body() body: CreateMassMovementDto) {
        return this.massMovementService.createMassMovement(body);
    }
}
