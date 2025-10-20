import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateHostelDto } from "src/models/dtos/create-hostel.dto";
import { Hostel, HostelDocument } from "src/models/schemas/hostel.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse} from "src/utils/response.utils";

@Injectable()
export class HostelService {
    constructor(
        @InjectModel(Hostel.name) private hostelModel: Model<HostelDocument>
    ){}

    async getAllHostel() {
        const hostels = await this.hostelModel.find()
        
        if(!hostels){
            handleError("No Hostels Found")
        }
        
        return {
            error:false,
            message:"Hostel Found",
            data: hostels
        }
    }
 
    async getHostelById(hostelId:string) {
        const hostel = await this.hostelModel.findOne({_id:hostelId});

        if(!hostel) {
            handleError("No Hostel Found for the Given Id")
        }

        return handleResponse(hostel,"Hostel Found");
    }

    async createHostel(createHostelDto: CreateHostelDto) {
        const existing = await this.hostelModel.find({name:createHostelDto.name})
        if(existing.length > 0)
            handleError("a hostel already exists with the name. Please Try a different name")

        const hostel = new this.hostelModel({
            ...createHostelDto
        })

        const savedHostel = await hostel.save();

        return handleResponse(savedHostel,"Hostel Created Sucessfully");
    }

    async updateHostel(hostelId:string, updateHostelDto: Partial<CreateHostelDto>) {
        let existing = await this.hostelModel.findOne({_id:hostelId})

        if(!existing) {
            handleError("No hostel found with that id");
        }

        await this.hostelModel.updateOne({_id:hostelId},{$set: updateHostelDto})

        const updated = await this.hostelModel.find({_id:hostelId})

        return handleResponse(updated,"Sucessfully Updated");
    }

    async deleteHostel(hostelId:string) {
        let existing = await this.hostelModel.findOne({_id:hostelId})

        if(!existing)
            handleError("No hostel found with that id")
        
        const delted = await this.hostelModel.deleteOne({_id:hostelId});

        return handleResponse({},"Sucessfully Deleted");
    }
}