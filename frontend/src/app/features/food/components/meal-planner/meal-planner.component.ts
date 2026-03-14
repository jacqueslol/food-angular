import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import {
  MealPlannerDay,
  MealType,
  Recipe,
  RecipeId
} from "../../../../core/models/food.models";

@Component({
  selector: "app-meal-planner",
  standalone: true,
  templateUrl: "./meal-planner.component.html",
  styleUrl: "./meal-planner.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealPlannerComponent {
  readonly show = input(false);
  readonly weekDays = input<MealPlannerDay[]>([]);
  readonly recipes = input<Recipe[]>([]);
  readonly selectedRecipeId = input<RecipeId | null>(null);
  readonly isEditMode = input(false);

  readonly close = output<void>();
  readonly weekChanged = output<string>();
  readonly toggleEditMode = output<void>();
  readonly assignRecipe = output<{ dayId: string; mealType: MealType }>();
  readonly removeRecipe = output<{ dayId: string; mealType: MealType; recipeId: RecipeId }>();
  readonly openRecipe = output<RecipeId>();

  readonly mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

  readonly recipesById = computed(() => {
    const map = new Map<RecipeId, Recipe>();
    this.recipes().forEach((recipe) => map.set(recipe.id, recipe));
    return map;
  });

  onWeekChanged(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.weekChanged.emit(value);
  }

  onAssignRecipe(dayId: string, mealType: MealType): void {
    if (this.selectedRecipeId() === null) {
      return;
    }
    this.assignRecipe.emit({ dayId, mealType });
  }

  onRecipeAction(dayId: string, mealType: MealType, recipeId: RecipeId): void {
    if (this.isEditMode()) {
      this.removeRecipe.emit({ dayId, mealType, recipeId });
      return;
    }
    this.openRecipe.emit(recipeId);
  }
}
