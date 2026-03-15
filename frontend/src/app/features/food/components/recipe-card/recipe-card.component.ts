import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarPlus, faClock, faStar, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import { Recipe, RecipeId } from '../../../../core/models/food.models';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [NgOptimizedImage, FontAwesomeModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCardComponent {
  readonly tagIcon = faTag;
  readonly userIcon = faUser;
  readonly clockIcon = faClock;
  readonly starIcon = faStar;
  readonly calendarPlusIcon = faCalendarPlus;

  readonly recipe = input.required<Recipe>();
  readonly selectedForPlanner = input(false);
  readonly priority = input(false);
  readonly openRecipe = output<RecipeId>();
  readonly addRecipeToPlanner = output<RecipeId>();

  onOpenRecipe(): void {
    this.openRecipe.emit(this.recipe().id);
  }

  onAddToPlanner(event: MouseEvent): void {
    event.stopPropagation();
    this.addRecipeToPlanner.emit(this.recipe().id);
  }
}
