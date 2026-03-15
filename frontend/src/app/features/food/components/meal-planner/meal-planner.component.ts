import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { MealPlannerDay, MealType, Recipe, RecipeId } from '../../../../core/models/food.models';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './meal-planner.component.html',
  styleUrl: './meal-planner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlannerComponent {
  readonly plusIcon = faPlus;
  readonly timesIcon = faTimes;
  readonly penIcon = faPencil;

  readonly show = input(false);
  readonly currentWeekId = input('');
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

  readonly mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

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
    this.close.emit();
  }
}
