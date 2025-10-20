import { Module } from '@nestjs/common';
import { ModelsModule } from 'src/models/models.module';
import { BlockController } from './block.controller';
import { HostelController } from './hostel.controller';
import { RoomController, RoomManagmentController } from './room.controller';
import { HostelService } from 'src/models/services/admin/hostel.service';
import { BlockService } from 'src/models/services/admin/block.service';
import { RoomService } from 'src/models/services/admin/room.service';

@Module({
    imports: [ModelsModule],
    providers: [HostelService,BlockService,RoomService],
    controllers: [HostelController,BlockController,RoomController,RoomManagmentController],
})
export class HostelModule {
    
}
