import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession } from "mongoose";
import { Model } from "mongoose";
import { retry } from "rxjs";
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
        const rooms = await this.roomModel.find({blockId}).populate({
            path:'currentStudents',
            select:'id name year department'
        });
        if(rooms.length == 0)
            return handleError("No room found for this block");
        
        return handleResponse(rooms,"Rooms Retrived Sucessfully");

    }

    async getRoomById(roomId:string) {
        const room = await this.roomModel.findById(roomId);
        if(!room)
            return handleError("No room found for this Id");

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
            return handleError("No room found for this Id");

        const block = await this.blockModel.findById(room.blockId).lean();
        
        if(!block)
            return handleError("This Room is Zombie its not assoiated with any block");

        const blockMaxFloor = block.totalFloors;
        
        if(createRoomDto.maxCapacity && room.currentStudents.length > createRoomDto.maxCapacity)
            return handleError("The Room Contains more number of students that the new capcaity")

        if(createRoomDto.floorNo && ( createRoomDto.floorNo < 0 || createRoomDto.floorNo >= blockMaxFloor))
            return handleError(`Invalid floor Number, For the Selected Block, floor Number should lie in the range of 0 - ${blockMaxFloor-1}`);

        await this.roomModel.updateOne({_id:roomId},{$set:createRoomDto})

        const updated = await this.roomModel.findById(roomId);

        return handleResponse(updated,"Room Updated Sucessfully");
    }

    async deleteRoom(roomId:string){
        const room = await this.roomModel.findById(roomId);
        if(!room)
            return handleError("No room found for this Id to delete")

        if(room.currentStudents.length > 0)
            return handleError("There are some students associated with the room! Please Remove them or change them to other romm")

        await this.roomModel.findByIdAndDelete(roomId);

        return handleResponse({},"Room Deleted Sucessfully")
    }

    async allocateStudentByRegisterNo(roomId: string,registerNo: string,hostelId: string){
        try {
            const studentProfile = await this.studentProfileModel.findOne({registerNo});
            if(!studentProfile)
                return handleError("No student found with the given register no")
            return await this.allocateStudent(roomId,studentProfile.id,hostelId);
        }catch(err){
            Logger.debug("Error Allocating the student");
        }
        return handleError("Failed to allocate studented");
    }

    async allocateStudent(roomId: string, studentId: string, hostelId: string, session?: ClientSession) {
        const room = await this.roomModel.findById(roomId, null, { session });
        if (!room)
            throw new Error("No room found for this Id to allocate");

        if (room.currentStudents.length >= room.maxCapacity)
            throw new Error("Room has reached its maximum capacity");

        const student = await this.studentProfileModel.findById(studentId, null, { session });
        if (!student)
            throw new Error("No student found for this Id to allocate");

        if (student.hostel)
            throw new Error("This student is already allocated in another room");

        const studentExists = room.currentStudents.some(
            (id: any) => id.toString() === studentId
        );

        if (studentExists)
            throw new Error("This student is already allocated to this room");

        await this.roomModel.findByIdAndUpdate(
            roomId,
            { $addToSet: { currentStudents: studentId } },
            { session }
        );

        await this.studentProfileModel.findByIdAndUpdate(
            studentId,
            { hostel: hostelId },
            { session }
        );

        return { message: "Student allocated successfully" };
    }



    async removeStudent(roomId: string, studentId: string, session?: ClientSession) {
        const room = await this.roomModel.findById(roomId, null, { session });
        if (!room)
            throw new Error("No room found for this Id to remove");

        const student = await this.studentProfileModel.findById(studentId, null, { session });
        if (!student)
            throw new Error("No student found for this Id to remove");

        const studentExists = room.currentStudents.some(
            (id: any) => id.toString() === studentId
        );

        if (!studentExists)
            throw new Error("Student is not allocated to this room");

        await this.roomModel.findByIdAndUpdate(
            roomId,
            { $pull: { currentStudents: studentId } },
            { session }
        );

        await this.studentProfileModel.findByIdAndUpdate(
            studentId,
            { hostel: null },
            { session }
        );

        return { message: "Student removed successfully" };
    }


}