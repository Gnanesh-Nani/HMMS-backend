import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from "@nestjs/common";
import { CreateRoomDto } from "src/models/dtos/create-room-dto";
import { RoomService } from "src/models/services/admin/room.service";

@Controller('/blocks/:blockId/rooms')
export class RoomController {
    constructor(
        @Inject(RoomService) private readonly roomService:RoomService
    ){}

    @Get()
    getAllRooms(@Param('blockId') blockId) { 
        return this.roomService.getAllRooms(blockId);
    }

    @Post()
    createRoom(@Param('blockId') blockId:string,@Body() body:CreateRoomDto) {
        return this.roomService.createRoom(blockId,body);
    }
}

@Controller('room')
export class RoomManagmentController {

    constructor(
        @Inject(RoomService) private readonly roomService:RoomService
    ){}

    @Get('/:roomId')
    getRoomById(@Param('roomId') roomId:string) { 
        return this.roomService.getRoomById(roomId);
    }

    @Patch('/:roomId')
    updateRoom(@Param('roomId') roomId,@Body() body: Partial<CreateRoomDto>) { 
        return this.roomService.updateRoom(roomId,body);
    }

    @Delete('/:roomId')
    deleteRoom(@Param('roomId') roomId) { 
        return this.roomService.deleteRoom(roomId);
    }

    @Patch('/:roomId/allocate/:studentId')
    allocateStudent(@Param('roomId') roomId:string,@Param('studentId') studentId:string,@Body() body: {hostelId:string}) {
        return this.roomService.allocateStudent(roomId,studentId,body.hostelId);
    }

    @Patch('/:roomId/remove/:studentId')
    removeStudent(@Param('roomId') roomId:string,@Param('studentId') studentId:string) { 
        return this.roomService.removeStudent(roomId,studentId);
    }
}