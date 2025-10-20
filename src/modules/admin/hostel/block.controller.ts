import { Controller, Get, Post, Patch, Delete, Param, Inject, Body } from "@nestjs/common";
import { CreateBlockDto } from "src/models/dtos/create-block.dto";
import { BlockService } from "src/models/services/admin/block.service";

@Controller('/hostel/:hostelId/block')
export class BlockController {

    constructor(
        @Inject(BlockService) private blockService: BlockService
    ){}

    @Get()
    getBlocks(@Param('hostelId') hostelId:string) { 
        return this.blockService.getAllBlocks(hostelId);
    }

    @Get('/:blockId')
    getBlock(@Param('hostelId') hostelId:string,@Param('blockId') blockId:string) {
        return this.blockService.getBlockById(hostelId,blockId);
    }

    @Post()
    createBlock(@Param('hostelId') hostelId,@Body() createBlockDto:CreateBlockDto) {
        return this.blockService.createBlock(hostelId,createBlockDto)
    }

    @Patch("/:blockId")
    updateBlock(@Param('hostelId') hostelId:string, @Param('blockId') blockId:string,@Body() body:Partial<CreateBlockDto>) {
        return this.blockService.updateBlock(hostelId,blockId,body);
    }

    @Delete("/:blockId")
    deleteBlock(@Param('hostelId') hostelId:string, @Param('blockId') blockId:string) {
        return this.blockService.deleteBlock(hostelId,blockId);
    }

} 