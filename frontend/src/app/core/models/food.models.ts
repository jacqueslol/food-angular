export type RecipeId = string | number;

export interface RecipeIngredient {
  qty: number;
  text: string;
}

export interface RecipeStep {
  text: string;
  showTimer: boolean;
  timerMins: number | null;
  videoTime: number | null;
}

export interface RecipeDetails {
  name: string;
  serves: number;
  servesText: string;
  tags: string[];
  prepTime: number;
  creator: string;
}

export interface Recipe {
  id: RecipeId;
  details: RecipeDetails;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  video: string;
  videoFormat: string;
  img: string;
}

export interface RecipeDraft extends Omit<Recipe, "id"> {
  id?: RecipeId;
}

export interface Tag {
  id: number;
  name: string;
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealPlannerDay {
  id: string;
  day: string;
  dateMonth: string;
  year: string;
  breakfast: RecipeId[];
  lunch: RecipeId[];
  dinner: RecipeId[];
}

export interface RecipeFilters {
  name: string;
  creator: string;
  durationLessThan: number | null;
  tags: string[];
  ingredients: string[];
}

export interface GlobalTimer {
  id: string;
  recipeId: RecipeId;
  recipeTitle: string;
  step: number;
  durationSec: number;
  remainingSec: number;
  paused: boolean;
  endAtMs: number | null;
}
