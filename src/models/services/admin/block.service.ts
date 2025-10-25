import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateBlockDto } from "src/models/dtos/create-block.dto";
import { Block, BlockDocument } from "src/models/schemas/block.schema";
import { Hostel, HostelDocument } from "src/models/schemas/hostel.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";

@Injectable()
export class BlockService {
    constructor(
        @InjectModel(Block.name) private readonly blockModel: Model<BlockDocument>,
        @InjectModel(Hostel.name) private readonly hostelModel: Model<HostelDocument>
    ){}

    async getAllBlocks(hostelId:string) {
        const blocks = await this.blockModel.find({hostelId});
        if(blocks.length == 0)
            handleError("No Blocks Found for this hostel");

        return handleResponse(blocks,"Sucessfully Retrived all blocks")
    }

    async getBlockById(hostelId:string, blockId:string){
        const block = await this.blockModel.findOne({hostelId,_id:blockId})
        if(!block)
            handleError("No Block Found")
        
        return handleResponse(block,"Sucessfully Retrivted block")
    }

    async createBlock(hostelId:string, createBlockDto: CreateBlockDto) {
        const hostel = await this.hostelModel.findOne({_id:hostelId});
        const existing_block = await this.blockModel.findOne({hostelId,name:createBlockDto.name});
        if(existing_block)
            handleError("A Block for that hostel with the same name alredy exist");
        if(!hostel)
            handleError("No Hostel Found");
    
        const block = new this.blockModel({...createBlockDto,hostelId});
        await this.hostelModel.updateOne({_id:hostelId},{$inc:{totalBlocks:1}});
        const savedBlock = await block.save();

        return handleResponse(savedBlock.toJSON(),"Block Created Sucessfully")
    }

    async updateBlock(hostelId:string, blockId:string, updateBlockDto: Partial<CreateBlockDto>) {

        const hostel = await this.hostelModel.findOne({_id:hostelId});
        const block = await this.blockModel.findOne({_id:blockId});

        if(!hostel)
            handleError("No Hostel Found");
        if(!block)
            handleError("No block Found");

        await this.blockModel.updateOne({_id:blockId},{$set: updateBlockDto});

        const update = await this.blockModel.find({_id:blockId});

        return handleResponse(update,"Sucessfully Update the block");
    }

    async deleteBlock(hostelId:string,blockId:string) {
        const hostel = await this.hostelModel.findOne({_id:hostelId});
        const block = await this.blockModel.findOne({_id:blockId});

        if(!hostel)
            handleError("No Hostel Found");
        if(!block)
            handleError("No block Found");

        await this.blockModel.deleteOne({_id:blockId});
        await this.hostelModel.updateOne({_id:hostelId},{$inc:{totalBlocks:-1}});
        return handleResponse({},"Sucessfully Deleted");
    }
}