import { Controller, Get, Patch, Post, Delete, Inject, Param, Body } from "@nestjs/common";
import { CreateHostelDto } from "src/models/dtos/create-hostel.dto";
import { HostelService } from "src/models/services/admin/hostel.service";

@Controller('hostel')
export class HostelController {
    constructor(
        @Inject(HostelService) private readonly hostelService: HostelService
    ){}
    @Get()
    getAllHostels() {
        return this.hostelService.getAllHostel();
    }

    @Get('/:id')
    getHostelById(@Param('id') id:string) {
        return this.hostelService.getHostelById(id);
    }

    @Post()
    createHostel(@Body() body) {
        return this.hostelService.createHostel(body);
    }

    @Patch('/:id')
    updateHostelById(@Param('id') id:string,@Body() body:Partial<CreateHostelDto>) {
        return this.hostelService.updateHostel(id,body);
    }

    @Delete('/:id')
    deleteHosetlById(@Param('id') id:string) {
        return this.hostelService.deleteHostel(id);
    }

}