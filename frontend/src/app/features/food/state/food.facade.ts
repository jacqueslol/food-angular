import { Injectable, inject } from "@angular/core";
import { MealType, RecipeId } from "../../../core/models/food.models";
import { NotificationService } from "../../../core/services/notification.service";
import { FoodPlannerFacade } from "./food-planner.facade";
import { FoodRecipesFacade } from "./food-recipes.facade";
import { FoodTimersService } from "./food-timers.service";

@Injectable({ providedIn: "root" })
export class FoodFacade {
  private readonly recipesState = inject(FoodRecipesFacade);
  private readonly plannerState = inject(FoodPlannerFacade);
  private readonly timersState = inject(FoodTimersService);
  private readonly notifications = inject(NotificationService);

  readonly recipes = this.recipesState.recipes;
  readonly tags = this.recipesState.tags;
  readonly selectedRecipe = this.recipesState.selectedRecipe;
  readonly minimizedRecipeIds = this.recipesState.minimizedRecipeIds;
  readonly showFilters = this.recipesState.showFilters;
  readonly activeStepByRecipeId = this.recipesState.activeStepByRecipeId;
  readonly editMode = this.recipesState.editMode;
  readonly loading = this.recipesState.loading;
  readonly error = this.recipesState.error;
  readonly filterState = this.recipesState.filterState;
  readonly ingredientsFilterInput = this.recipesState.ingredientsFilterInput;
  readonly filteredRecipes = this.recipesState.filteredRecipes;

  readonly showPlanner = this.plannerState.showPlanner;
  readonly plannerEditMode = this.plannerState.plannerEditMode;
  readonly selectedRecipeForPlanner = this.plannerState.selectedRecipeForPlanner;
  readonly weekId = this.plannerState.weekId;
  readonly currentWeekDays = this.plannerState.currentWeekDays;

  readonly globalTimers = this.timersState.globalTimers;

  constructor() {
    void this.loadInitialData();
  }

  destroy(): void {
    this.timersState.ngOnDestroy();
  }

  async loadInitialData(): Promise<void> {
    await Promise.all([this.recipesState.loadInitialData(), this.plannerState.loadMealplannerData()]);
  }

  openRecipe(recipeId: RecipeId): void {
    this.recipesState.openRecipe(recipeId);
  }

  closeRecipe(mode: "exit" | "minimize"): void {
    this.recipesState.closeRecipe(mode);
  }

  closeMinimizedTab(recipeId: RecipeId): void {
    this.recipesState.closeMinimizedTab(recipeId);
  }

  startNewRecipe(): void {
    this.recipesState.startNewRecipe();
  }

  async saveNewRecipe(): Promise<void> {
    await this.recipesState.saveNewRecipe();
  }

  async updateRecipe(): Promise<void> {
    await this.recipesState.updateRecipe();
  }

  async resetRecipe(): Promise<void> {
    await this.recipesState.resetRecipe();
  }

  async deleteSelectedRecipe(): Promise<void> {
    await this.recipesState.deleteSelectedRecipe();
  }

  setActiveStep(stepNumber: number): void {
    this.recipesState.setActiveStep(stepNumber);
  }

  updateIngredientsFilter(rawValue: string): void {
    this.recipesState.updateIngredientsFilter(rawValue);
  }

  setNameFilter(name: string): void {
    this.recipesState.setNameFilter(name);
  }

  setCreatorFilter(creator: string): void {
    this.recipesState.setCreatorFilter(creator);
  }

  setTagFilters(tags: string[]): void {
    this.recipesState.setTagFilters(tags);
  }

  toggleFilters(): void {
    this.recipesState.toggleFilters();
  }

  toggleRecipeEditMode(): void {
    this.recipesState.toggleEditMode();
  }

  removeFilterIngredient(ingredient: string): void {
    this.recipesState.removeFilterIngredient(ingredient);
  }

  removeFilterTag(tag: string): void {
    this.recipesState.removeFilterTag(tag);
  }

  onDurationFilterChanged(rawValue: string | number | null): void {
    this.recipesState.onDurationFilterChanged(rawValue);
  }

  addToPlanner(recipeId: RecipeId): void {
    this.plannerState.addToPlanner(recipeId);
  }

  togglePlanner(): void {
    this.plannerState.togglePlanner();
  }

  closePlanner(): void {
    this.plannerState.closePlanner();
  }

  setWeekId(weekId: string): void {
    this.plannerState.setWeekId(weekId);
  }

  togglePlannerEditMode(): void {
    this.plannerState.togglePlannerEditMode();
  }

  clearPlannerSelection(): void {
    this.plannerState.clearPlannerSelection();
  }

  async assignRecipeToDay(data: { dayId: string; mealType: MealType }): Promise<void> {
    await this.plannerState.assignRecipeToDay(data);
  }

  async removeRecipeFromDay(data: {
    dayId: string;
    mealType: MealType;
    recipeId: RecipeId;
  }): Promise<void> {
    await this.plannerState.removeRecipeFromDay(data);
  }

  addGlobalTimer(data: { stepIndex: number; timerMins: number }): void {
    const draft = this.selectedRecipe();
    if (!draft?.id || data.timerMins <= 0) {
      return;
    }
    this.timersState.addGlobalTimer(draft.id, draft.details.name, data.stepIndex, data.timerMins);
  }

  toggleTimerPause(timerId: string): void {
    this.timersState.toggleTimerPause(timerId);
  }

  resetTimer(timerId: string): void {
    this.timersState.resetTimer(timerId);
  }

  removeTimer(timerId: string): void {
    this.timersState.removeTimer(timerId);
  }

  formatTimer(seconds: number): string {
    return this.timersState.formatTimer(seconds);
  }

  notifyWarning(message: string): void {
    this.notifications.warning(message);
  }
}
