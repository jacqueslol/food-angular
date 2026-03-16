import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Recipe,
  RecipeDraft,
  RecipeFilters,
  RecipeId,
  Tag,
} from '../../../core/models/food.models';
import { FoodApiService } from '../../../core/services/food-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { cloneRecipe, createEmptyRecipeDraft } from '../utils/food.utils';

@Injectable({ providedIn: 'root' })
export class FoodRecipesFacade {
  private static readonly TAB_STORAGE_KEY = 'food.minimizedTabs';
  private static readonly RESERVED_VIDEO_TAG = 'video';
  private readonly api = inject(FoodApiService);
  private readonly notifications = inject(NotificationService);

  readonly recipes = signal<Recipe[]>([]);
  readonly tags = signal<Tag[]>([]);
  readonly selectedRecipe = signal<RecipeDraft | null>(null);
  readonly minimizedRecipeIds = signal<RecipeId[]>([]);
  readonly activeStepByRecipeId = signal<Record<string, number | null>>({});
  readonly editMode = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showFilters = signal(false);
  readonly filterState = signal<RecipeFilters>({
    name: '',
    creator: '',
    durationLessThan: null,
    tags: [],
    ingredients: [],
  });
  readonly ingredientsFilterInput = signal('');

  readonly filteredRecipes = computed(() => {
    const recipes = this.recipes();
    const filters = this.filterState();

    return recipes.filter((recipe) => {
      const nameMatches =
        !filters.name || recipe.details.name.toLowerCase().includes(filters.name.toLowerCase());
      const creatorMatches =
        !filters.creator ||
        recipe.details.creator.toLowerCase().includes(filters.creator.toLowerCase());
      const durationMatches =
        filters.durationLessThan === null || recipe.details.prepTime <= filters.durationLessThan;
      const tagsMatch =
        filters.tags.length === 0 || filters.tags.every((tag) => recipe.details.tags.includes(tag));
      const ingredientsMatch =
        filters.ingredients.length === 0 ||
        filters.ingredients.every((ingredientFilter) =>
          recipe.ingredients.some((ingredient) =>
            ingredient.text.toLowerCase().includes(ingredientFilter.toLowerCase()),
          ),
        );
      return nameMatches && creatorMatches && durationMatches && tagsMatch && ingredientsMatch;
    });
  });

  constructor() {
    this.restoreTabs();
    effect(() => {
      window.localStorage.setItem(
        FoodRecipesFacade.TAB_STORAGE_KEY,
        JSON.stringify(this.minimizedRecipeIds()),
      );
    });
  }

  async loadInitialData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [recipes, tags] = await Promise.all([this.api.getRecipes(), this.api.getTags()]);
      this.recipes.set(recipes);
      this.tags.set(tags);
      this.minimizedRecipeIds.update((ids) =>
        ids.filter((id) => recipes.some((recipe) => recipe.id === id)),
      );
    } catch {
      const message = 'Could not load Food data from API.';
      this.error.set(message);
      this.notifications.error(message);
    } finally {
      this.loading.set(false);
    }
  }

  openRecipe(recipeId: RecipeId): void {
    const recipe = this.recipes().find((entry) => entry.id === recipeId);
    if (!recipe) {
      return;
    }
    if (!this.minimizedRecipeIds().includes(recipeId)) {
      this.minimizedRecipeIds.update((ids) => [...ids, recipeId]);
    }
    this.selectedRecipe.set(cloneRecipe(recipe));
    this.editMode.set(false);
  }

  closeRecipe(mode: 'exit' | 'minimize'): void {
    const current = this.selectedRecipe();
    if (!current) {
      return;
    }
    if (mode === 'exit' && current.id !== undefined) {
      this.minimizedRecipeIds.update((ids) => ids.filter((id) => id !== current.id));
    }
    this.selectedRecipe.set(null);
    this.editMode.set(false);
  }

  closeMinimizedTab(recipeId: RecipeId): void {
    this.minimizedRecipeIds.update((ids) => ids.filter((id) => id !== recipeId));
    if (this.selectedRecipe()?.id === recipeId) {
      this.selectedRecipe.set(null);
      this.editMode.set(false);
    }
  }

  startNewRecipe(): void {
    this.selectedRecipe.set(createEmptyRecipeDraft());
    this.editMode.set(true);
  }

  async saveNewRecipe(): Promise<void> {
    const draft = this.selectedRecipe();
    if (!draft) {
      return;
    }
    try {
      const payload = this.toPayloadWithoutReservedTags(draft);
      await this.persistMissingTags(payload.details.tags);
      const created = await this.api.createRecipe(payload);
      this.recipes.update((recipes) => [...recipes, created]);
      this.selectedRecipe.set(cloneRecipe(created));
      this.minimizedRecipeIds.update((ids) => [...new Set([...ids, created.id])]);
      this.editMode.set(false);
      await this.reloadTags();
      this.notifications.success('Recipe added successfully.');
    } catch (error) {
      this.notifications.error(getErrorMessage(error, 'Could not add recipe.'));
    }
  }

  async updateRecipe(): Promise<void> {
    const draft = this.selectedRecipe();
    if (!draft?.id) {
      return;
    }
    try {
      const payload = this.toPayloadWithoutReservedTags(draft);
      await this.persistMissingTags(payload.details.tags);
      const updated = await this.api.updateRecipe(draft.id, payload);
      this.recipes.update((recipes) =>
        recipes.map((recipe) => (recipe.id === updated.id ? updated : recipe)),
      );
      this.selectedRecipe.set(cloneRecipe(updated));
      this.editMode.set(false);
      await this.reloadTags();
      this.notifications.success('Recipe updated successfully.');
    } catch (error) {
      this.notifications.error(getErrorMessage(error, 'Could not update recipe.'));
    }
  }

  async resetRecipe(): Promise<void> {
    const draft = this.selectedRecipe();
    if (!draft?.id) {
      this.selectedRecipe.set(createEmptyRecipeDraft());
      return;
    }
    try {
      const fromApi = await this.api.getRecipeById(draft.id);
      this.selectedRecipe.set(cloneRecipe(fromApi));
      this.editMode.set(false);
      this.notifications.info('Recipe changes reset.');
    } catch (error) {
      this.notifications.error(getErrorMessage(error, 'Could not reset recipe.'));
    }
  }

  async deleteSelectedRecipe(): Promise<void> {
    const draft = this.selectedRecipe();
    if (!draft?.id) {
      return;
    }
    try {
      if (confirm('(CONFIRMS WIP) Are you sure you want to delete this entry?')) {
        await this.api.deleteRecipe(draft.id);
        this.recipes.update((recipes) => recipes.filter((recipe) => recipe.id !== draft.id));
        this.closeMinimizedTab(draft.id);
        this.notifications.success('Recipe deleted successfully.');
      }
    } catch (error) {
      this.notifications.error(getErrorMessage(error, 'Could not delete recipe.'));
    }
  }

  setActiveStep(stepNumber: number): void {
    const draft = this.selectedRecipe();
    if (!draft?.id) {
      return;
    }
    this.activeStepByRecipeId.update((map) => ({
      ...map,
      [String(draft.id)]: map[String(draft.id)] === stepNumber ? null : stepNumber,
    }));
  }

  updateIngredientsFilter(rawValue: string): void {
    this.ingredientsFilterInput.set(rawValue);
    const normalized = rawValue
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean);
    this.filterState.update((state) => ({
      ...state,
      ingredients: [...new Set(normalized)],
    }));
  }

  removeFilterIngredient(ingredient: string): void {
    const updated = this.filterState().ingredients.filter((entry) => entry !== ingredient);
    this.filterState.update((state) => ({ ...state, ingredients: updated }));
    this.ingredientsFilterInput.set(updated.join(' | '));
  }

  removeFilterTag(tag: string): void {
    this.filterState.update((state) => ({
      ...state,
      tags: state.tags.filter((entry) => entry !== tag),
    }));
  }

  onDurationFilterChanged(rawValue: string | number | null): void {
    const parsed = Number(rawValue);
    this.filterState.update((state) => ({
      ...state,
      durationLessThan: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    }));
  }

  setNameFilter(name: string): void {
    this.filterState.update((state) => ({ ...state, name }));
  }

  setCreatorFilter(creator: string): void {
    this.filterState.update((state) => ({ ...state, creator }));
  }

  setTagFilters(tags: string[]): void {
    this.filterState.update((state) => ({ ...state, tags }));
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  toggleEditMode(): void {
    this.editMode.update((value) => !value);
  }

  notifyWarning(message: string): void {
    this.notifications.warning(message);
  }

  private async reloadTags(): Promise<void> {
    this.tags.set(await this.api.getTags());
  }

  private async persistMissingTags(incomingTags: string[]): Promise<void> {
    const existing = new Set(this.tags().map((tag) => tag.name));
    const missing = [...new Set(incomingTags.map((tag) => tag.trim().toLowerCase()))].filter(
      (tag) => tag && !existing.has(tag),
    );
    await Promise.all(missing.map((tag) => this.api.createTag(tag)));
  }

  private toPayloadWithoutReservedTags(draft: RecipeDraft): RecipeDraft {
    const payload = cloneRecipe(draft);
    payload.details.tags = payload.details.tags.filter(
      (tag) => tag.trim().toLowerCase() !== FoodRecipesFacade.RESERVED_VIDEO_TAG,
    );
    return payload;
  }

  private restoreTabs(): void {
    try {
      const raw = window.localStorage.getItem(FoodRecipesFacade.TAB_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as RecipeId[];
      if (Array.isArray(parsed)) {
        this.minimizedRecipeIds.set([
          ...new Set(
            parsed.filter((value) => typeof value === 'number' || typeof value === 'string'),
          ),
        ]);
      }
    } catch {
      this.minimizedRecipeIds.set([]);
    }
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  const candidate = error as { error?: { error?: string } | string; message?: string };
  if (typeof candidate?.error === 'string') {
    return candidate.error;
  }
  if (typeof candidate?.error === 'object' && typeof candidate.error?.error === 'string') {
    return candidate.error.error;
  }
  if (typeof candidate?.message === 'string') {
    return candidate.message;
  }
  return fallback;
}
