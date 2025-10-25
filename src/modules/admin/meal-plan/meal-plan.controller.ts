import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateMealPlanDto } from 'src/models/dtos/create-meal-plan.dto';
import { MealPlanService } from 'src/models/services/admin/meal-plan.service';

@Controller('meal-plan')
export class MealPlanController {
    constructor(
        @Inject(MealPlanService) private readonly mealPlanService: MealPlanService 
    ){}

    @Get()
    getAllMealPlans() {
        return this.mealPlanService.getAllMealPlans();
    }

    @Get(':mealPlanId') 
    getMealPlanById(@Param('mealPlanId') id:string) {
        return this.mealPlanService.getMealPlanById(id);
    }

    @Post()
    createMealPlan(@Body() createMealPlanDto: CreateMealPlanDto) {
        return this.mealPlanService.createMealPlan(createMealPlanDto);
    }

    @Patch(':mealPlanId')
    updateMealPlan(@Param('mealPlanId') id:string,@Body() body: Partial<CreateMealPlanDto>) {
        return this.mealPlanService.updateMealPlan(id,body)
    }

    @Delete(':mealPlanId')
    deleteMealPlan(@Param('mealPlanId') id:string) {
        return this.mealPlanService.deleteMealPlan(id);
    }   
}
