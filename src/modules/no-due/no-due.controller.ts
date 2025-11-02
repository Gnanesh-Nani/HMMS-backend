import { Body, Controller, Get, Inject, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NoDueService } from 'src/models/services/no-due.service';

@Controller('no-due')
export class NoDueController {
    constructor(@Inject(NoDueService) private noDueService: NoDueService) {}
    
    @Post('generate/:studentProfileId')
    async generateNoDue(@Param('studentProfileId') studentProfileId: string, @Res() res: Response, @Body() body){
        return await this.noDueService.generateNoDue(studentProfileId,res,body);
    }
                
    @Get('verify/:studentProfileId')
    async verifyNoDue(@Param('studentProfileId') studentProfileId: string){
        return await this.noDueService.verifyNoDue(studentProfileId);
    }

}
