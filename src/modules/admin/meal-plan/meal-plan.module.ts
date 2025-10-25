import { Module } from '@nestjs/common';
import { MealPlanController } from './meal-plan.controller';
import { ModelsModule } from 'src/models/models.module';
import { MealPlanService } from 'src/models/services/admin/meal-plan.service';

@Module({
  imports: [ModelsModule],
  providers: [MealPlanService],
  controllers: [MealPlanController]
})
export class MealPlanModule {}
