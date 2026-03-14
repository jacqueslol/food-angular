import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RecipeDraft } from "../../../../core/models/food.models";

@Component({
  selector: "app-recipe-editor",
  standalone: true,
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: "./recipe-editor.component.html",
  styleUrl: "./recipe-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeEditorComponent {
  private static readonly RESERVED_VIDEO_TAG = "video";
  private servesScaleBaseline: number | null = null;

  readonly recipe = input<RecipeDraft | null>(null);
  readonly availableTags = input<string[]>([]);
  readonly activeStep = input<number | null>(null);
  readonly editMode = input(false);

  readonly closeEditor = output<"exit" | "minimize">();
  readonly toggleEditMode = output<void>();
  readonly saveNewRecipe = output<void>();
  readonly updateRecipe = output<void>();
  readonly resetRecipe = output<void>();
  readonly deleteRecipe = output<void>();
  readonly addRecipeToPlanner = output<void>();
  readonly setActiveStep = output<number>();
  readonly addStepTimer = output<{ stepIndex: number; timerMins: number }>();
  readonly uiNotification = output<string>();

  tagInput = "";

  addTag(): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }
    const candidate = this.tagInput.trim().toLowerCase();
    if (!candidate) {
      return;
    }
    if (candidate === RecipeEditorComponent.RESERVED_VIDEO_TAG) {
      this.uiNotification.emit('"video" is reserved and is set automatically when a recipe has a video URL.');
      return;
    }
    if (draft.details.tags.includes(candidate)) {
      this.uiNotification.emit("That tag already exists on this recipe.");
      return;
    }
    draft.details.tags = [...draft.details.tags, candidate].sort();
    this.tagInput = "";
  }

  removeTag(tag: string): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }
    draft.details.tags = draft.details.tags.filter((value) => value !== tag);
  }

  addIngredient(): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }
    draft.ingredients = [...draft.ingredients, { qty: 1, text: "ingredient" }];
  }

  removeIngredient(index: number): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }
    draft.ingredients = draft.ingredients.filter((_, currentIndex) => currentIndex !== index);
  }

  addStep(): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }
    draft.steps = [
      ...draft.steps,
      { text: "Describe this step", showTimer: false, timerMins: null, videoTime: null }
    ];
  }

  removeStep(index: number): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }
    draft.steps = draft.steps.filter((_, currentIndex) => currentIndex !== index);
  }

  async pasteIngredients(): Promise<void> {
    const draft = this.recipe();
    if (!draft) {
      return;
    }

    const text = await navigator.clipboard.readText();
    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    draft.ingredients = rows.map((row) => {
      const firstNumber = row.match(/^\d+(\.\d+)?/);
      const qty = firstNumber ? Number(firstNumber[0]) : 0;
      const ingredientText = firstNumber ? row.slice(firstNumber[0].length).trim() : row;
      return {
        qty,
        text: ingredientText
      };
    });
  }

  async pasteSteps(): Promise<void> {
    const draft = this.recipe();
    if (!draft) {
      return;
    }

    const text = await navigator.clipboard.readText();
    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    draft.steps = rows.map((row) => ({
      text: row,
      showTimer: false,
      timerMins: null,
      videoTime: null
    }));
  }

  captureServesBaseline(currentServes: number): void {
    this.servesScaleBaseline = Number.isFinite(currentServes) && currentServes > 0
      ? currentServes
      : null;
  }

  scaleIngredientsFromServesChange(newServesRaw: number): void {
    const draft = this.recipe();
    if (!draft) {
      return;
    }

    // In edit mode, serves is directly editable and should not rescale ingredients.
    if (this.editMode()) {
      this.servesScaleBaseline = null;
      return;
    }

    const newServes = Number(newServesRaw);
    if (!Number.isFinite(newServes) || newServes <= 0) {
      return;
    }

    const baseline = this.servesScaleBaseline;
    if (!baseline || baseline <= 0) {
      this.servesScaleBaseline = newServes;
      return;
    }

    draft.ingredients = draft.ingredients.map((ingredient) => {
      const qty = Number(ingredient.qty);
      if (!Number.isFinite(qty)) {
        return ingredient;
      }
      return {
        ...ingredient,
        qty: (qty / baseline) * newServes
      };
    });

    this.servesScaleBaseline = newServes;
  }
}
