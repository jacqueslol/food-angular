import { Injectable, computed, inject, signal } from "@angular/core";
import { MealPlannerDay, MealType, RecipeId } from "../../../core/models/food.models";
import { FoodApiService } from "../../../core/services/food-api.service";
import { NotificationService } from "../../../core/services/notification.service";
import { buildWeekDays, getWeekIdentifier } from "../utils/food.utils";

@Injectable({ providedIn: "root" })
export class FoodPlannerFacade {
  private readonly api = inject(FoodApiService);
  private readonly notifications = inject(NotificationService);

  readonly showPlanner = signal(false);
  readonly plannerEditMode = signal(false);
  readonly selectedRecipeForPlanner = signal<RecipeId | null>(null);
  readonly allMealPlannerDays = signal<MealPlannerDay[]>([]);
  readonly weekId = signal(getWeekIdentifier());

  readonly currentWeekDays = computed(() =>
    buildWeekDays(this.weekId(), this.allMealPlannerDays())
  );

  async loadMealplannerData(): Promise<void> {
    try {
      const mealplanner = await this.api.getMealplannerEntries();
      this.allMealPlannerDays.set(mealplanner);
    } catch {
      this.notifications.error("Could not load meal planner data.");
    }
  }

  addToPlanner(recipeId: RecipeId): void {
    this.selectedRecipeForPlanner.set(recipeId);
    this.showPlanner.set(true);
  }

  togglePlanner(): void {
    this.showPlanner.update((value) => !value);
  }

  closePlanner(): void {
    this.showPlanner.set(false);
    this.selectedRecipeForPlanner.set(null);
  }

  setWeekId(weekId: string): void {
    this.weekId.set(weekId);
  }

  togglePlannerEditMode(): void {
    this.plannerEditMode.update((value) => !value);
  }

  clearPlannerSelection(): void {
    this.selectedRecipeForPlanner.set(null);
  }

  async assignRecipeToDay(data: { dayId: string; mealType: MealType }): Promise<void> {
    const recipeId = this.selectedRecipeForPlanner();
    if (recipeId === null) {
      return;
    }
    const target = this.currentWeekDays().find((day) => day.id === data.dayId);
    if (!target) {
      return;
    }
    if (target[data.mealType].includes(recipeId)) {
      this.notifications.warning("This recipe is already planned for that meal.");
      return;
    }
    const updatedDay: MealPlannerDay = {
      ...target,
      [data.mealType]: [...target[data.mealType], recipeId]
    };
    try {
      await this.api.upsertMealplannerDay(updatedDay);
      this.allMealPlannerDays.update((days) => upsertMealplannerDay(days, updatedDay));
      this.selectedRecipeForPlanner.set(null);
      this.notifications.success("Recipe added to planner.");
    } catch {
      this.notifications.error("Could not update meal planner.");
    }
  }

  async removeRecipeFromDay(data: {
    dayId: string;
    mealType: MealType;
    recipeId: RecipeId;
  }): Promise<void> {
    const target = this.currentWeekDays().find((day) => day.id === data.dayId);
    if (!target) {
      return;
    }
    const updatedDay: MealPlannerDay = {
      ...target,
      [data.mealType]: target[data.mealType].filter((id) => id !== data.recipeId)
    };
    try {
      await this.api.upsertMealplannerDay(updatedDay);
      this.allMealPlannerDays.update((days) => upsertMealplannerDay(days, updatedDay));
      this.notifications.success("Planned recipe removed.");
    } catch {
      this.notifications.error("Could not update meal planner.");
    }
  }
}

function upsertMealplannerDay(days: MealPlannerDay[], updatedDay: MealPlannerDay): MealPlannerDay[] {
  const existingIndex = days.findIndex((day) => day.id === updatedDay.id);
  if (existingIndex < 0) {
    return [...days, updatedDay];
  }
  const next = [...days];
  next[existingIndex] = updatedDay;
  return next;
}
