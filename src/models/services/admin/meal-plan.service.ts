import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateMealPlanDto } from "src/models/dtos/create-meal-plan.dto";
import { MealPlan, MealPlanDocument } from "src/models/schemas/meal-plan.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";
import { Logger } from "@nestjs/common";
@Injectable()
export class MealPlanService {
    constructor(@InjectModel(MealPlan.name) private readonly mealPlanModel: Model<MealPlanDocument>){}

    async getAllMealPlans() {
        const mealPlans = await this.mealPlanModel.find();

        if(mealPlans.length == 0)
            return handleError("No mealPlans Found");
        
        return handleResponse(mealPlans,"Sucessfully Retrived Meal Plans");
    }

    async getMealPlanById(mealPlanId:string) {
        const mealPlan = await this.mealPlanModel.findById(mealPlanId);
        if(!mealPlan)
            handleError("No mealPlan Found for the given Id");
    
        return handleResponse(mealPlan,"Sucessfully Retrived Meal Plan");
    }

    async createMealPlan(createMealPlanDto:CreateMealPlanDto){

        const exist = await this.mealPlanModel.findOne({name:createMealPlanDto.name});
        if(exist) 
            return handleError("A Meal Plan alredy has the Same name! Pleas Try a Differnt one");
        const mealPlan = new this.mealPlanModel(createMealPlanDto)
        await mealPlan.save()

        return handleResponse(mealPlan,"Sucessfully Saved the Meal Plan");
    }

    async updateMealPlan(mealPlanId:string, updateDto: Partial<CreateMealPlanDto>) {
        const mealPlan = await this.mealPlanModel.findById(mealPlanId);
        if(!mealPlan)
            return handleError("No Meal Plan Found for the given Id")

        if(updateDto.name)
            mealPlan.name = updateDto.name
    
        if(updateDto.meals && updateDto.meals.length > 0) {
            const existingMeals = mealPlan.meals;

            updateDto.meals.forEach((newMeal) => {
                const index = existingMeals.findIndex(m => m.day == newMeal.day)

                if(index !== -1) {
                    existingMeals[index] = newMeal;
                } 

            })

            mealPlan.meals = existingMeals;
        }

        const savedMealPlan = await mealPlan.save();

        return handleResponse(savedMealPlan,"Sucessfully Saved the Meal Plan");
    }

    async deleteMealPlan(mealPlanId:string) {
        const deletedMealPlan = await this.mealPlanModel.findByIdAndDelete(mealPlanId);
        if(!deletedMealPlan)
            handleError("No Meal Plan Found For the Given Id to Deleet");
        return handleResponse({},"Sucessfully Deleted the Meal Plan");
    }

}