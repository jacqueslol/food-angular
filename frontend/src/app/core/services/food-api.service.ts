import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  MealPlannerDay,
  Recipe,
  RecipeId,
  RecipeDraft,
  Tag
} from "../models/food.models";

@Injectable({ providedIn: "root" })
export class FoodApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = "/api";

  async getRecipes(query?: Record<string, string | number>): Promise<Recipe[]> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        params = params.set(key, String(value));
      });
    }
    return firstValueFrom(
      this.http.get<Recipe[]>(`${this.apiBase}/recipes`, { params })
    );
  }

  async getRecipeById(id: RecipeId): Promise<Recipe> {
    return firstValueFrom(this.http.get<Recipe>(`${this.apiBase}/recipes/${id}`));
  }

  async createRecipe(payload: RecipeDraft): Promise<Recipe> {
    return firstValueFrom(this.http.post<Recipe>(`${this.apiBase}/recipes`, payload));
  }

  async updateRecipe(id: RecipeId, payload: RecipeDraft): Promise<Recipe> {
    return firstValueFrom(
      this.http.put<Recipe>(`${this.apiBase}/recipes/${id}`, payload)
    );
  }

  async deleteRecipe(id: RecipeId): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiBase}/recipes/${id}`));
  }

  async getTags(): Promise<Tag[]> {
    return firstValueFrom(this.http.get<Tag[]>(`${this.apiBase}/tags`));
  }

  async createTag(name: string): Promise<Tag> {
    return firstValueFrom(this.http.post<Tag>(`${this.apiBase}/tags`, { name }));
  }

  async getMealplannerEntries(): Promise<MealPlannerDay[]> {
    return firstValueFrom(
      this.http.get<MealPlannerDay[]>(`${this.apiBase}/mealplanner`)
    );
  }

  async upsertMealplannerDay(day: MealPlannerDay): Promise<MealPlannerDay> {
    const exists = await this.mealplannerEntryExists(day.id);
    if (exists) {
      return firstValueFrom(
        this.http.put<MealPlannerDay>(`${this.apiBase}/mealplanner/${day.id}`, day)
      );
    }
    return firstValueFrom(
      this.http.post<MealPlannerDay>(`${this.apiBase}/mealplanner`, day)
    );
  }

  private async mealplannerEntryExists(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.get(`${this.apiBase}/mealplanner/${id}`));
      return true;
    } catch {
      return false;
    }
  }
}
