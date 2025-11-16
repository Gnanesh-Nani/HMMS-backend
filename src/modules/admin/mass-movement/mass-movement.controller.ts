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

    @Get('get-dataset/:massMovementId/:year')
    createPreferenceDataSet(@Param('massMovementId') id: string,@Param('year') year: string) {
        return this.massMovementService.createPreferenceDataSet(id,parseInt(year));
    }


    @Post('allocate-hostel/:massMovementId/:hostelId/:year')
        allocateHostel(
        @Param('massMovementId') massMovementId: string,
        @Param('hostelId') hostelId: string,
        @Param('year') year: string
    ) {
        return this.massMovementService.triggerAllocation(massMovementId, hostelId, parseInt(year));
    }
}
