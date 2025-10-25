import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "src/models/dtos/create-room-dto";
import { Block, BlockDocument } from "src/models/schemas/block.schema";
import { Room, RoomDocument } from "src/models/schemas/room.schema";
import { StudentProfileDocument, StudentProfile } from "src/models/schemas/student-profile.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";

@Injectable() 
export class RoomService {
    constructor(
        @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
        @InjectModel(Block.name) private readonly blockModel: Model<BlockDocument>,
        @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>
    ){}

    async getAllRooms(blockId:string) {
        const rooms = await this.roomModel.find({blockId});
        if(rooms.length == 0)
            handleError("No room found for this block");
        
        return handleResponse(rooms,"Rooms Retrived Sucessfully");

    }

    async getRoomById(roomId:string) {
        const room = await this.roomModel.findById(roomId);
        if(!room)
            handleError("No room found for this Id");

        return handleResponse(room,"Room Retrived Sucessfully");
    }

    async createRoom(blockId:string,createRoomDto:CreateRoomDto) { 
        const room = await this.roomModel.findOne({blockId,roomNo:createRoomDto.roomNo});
        const block = await this.blockModel.findById(blockId).lean();
        if(room)
            return handleError("a room already exist in the same block with same room no");
        
        if(!block)
            return handleError("No block is found for the given block id");

        const blockMaxFloor = block.totalFloors;

        if(createRoomDto.floorNo < 0 || createRoomDto.floorNo >= blockMaxFloor )
            return handleError(`Invalid floor Number, For the Selected Block, floor Number should lie in the range of 0 - ${blockMaxFloor-1}`);

        const newRoom = new this.roomModel({blockId, ...createRoomDto})

        const savedRoom = newRoom.save();

        return handleResponse(savedRoom, "Room Created Sucessfully");
    }

    async updateRoom(roomId:string,createRoomDto: Partial<CreateRoomDto>) {

        const room = await this.roomModel.findById(roomId);
        if(!room)
            handleError("No room found for this Id");

        await this.roomModel.updateOne({_id:roomId},{$set:createRoomDto})

        const updated = await this.roomModel.findById(roomId);

        return handleResponse(updated,"Room Updated Sucessfully");
    }

    async deleteRoom(roomId:string){
        const room = await this.roomModel.findById(roomId);
        if(!room)
            handleError("No room found for this Id to delete")

        await this.roomModel.findByIdAndDelete(roomId);

        return handleResponse({},"Room Deleted Sucessfully")
    }

    async allocateStudent(roomId:string,studentId:string){
        const room = await this.roomModel.findById(roomId);
        if(!room)
            return handleError("No room found for this Id to allocat")

        const student = await this.studentProfileModel.findById(studentId);
        if(!student)
            return handleError("No student found for this Id to allocate")

        const studentExists = room.currentStudents.some(
            (id: any) => id.toString() === studentId
        );

        if (studentExists) {
            return handleError("This Student is already allocated to this room");
        }
        await this.roomModel.findByIdAndUpdate(
            roomId, {$addToSet:{ currentStudents: studentId }}
        );
        return handleResponse({},"students inserted Sucessfully")
    }
    
    
    async removeStudent(roomId:string,studentId:string){
        const room = await this.roomModel.findById(roomId);
        if(!room)
            return handleError("No room found for this Id to allocat")

        const student = await this.studentProfileModel.findById(studentId);
        if(!student)
            return handleError("No student found for this Id to allocate")

        const studentExists = room.currentStudents.some(
            (id: any) => id.toString() === studentId
        );

        if (!studentExists) {
            handleError("Student is not allocated to this room");
        }

        await this.roomModel.findByIdAndUpdate(
            roomId, {$pull:{ currentStudents: studentId }}
        );
        return handleResponse({},"students removed Sucessfully")
    }

}