import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';
import { HostelModule } from './hostel/hostel.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MassMovementModule } from './mass-movement/mass-movement.module';

@Module({
    imports: [RegisterModule, HostelModule, MealPlanModule, NotificationsModule,MassMovementModule],
})
export class AdminModule {}
