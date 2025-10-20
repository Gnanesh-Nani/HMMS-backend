import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';
import { HostelModule } from './hostel/hostel.module';

@Module({
    imports: [RegisterModule, HostelModule],
})
export class AdminModule {}
