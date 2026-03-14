import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MealPlannerComponent } from './features/food/components/meal-planner/meal-planner.component';
import { RecipeCardComponent } from './features/food/components/recipe-card/recipe-card.component';
import { RecipeEditorComponent } from './features/food/components/recipe-editor/recipe-editor.component';
import { FoodFacade } from './features/food/state/food.facade';
import { NotificationsPopupComponent } from './shared/components/notifications-popup/notifications-popup.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    RecipeCardComponent,
    RecipeEditorComponent,
    MealPlannerComponent,
    NotificationsPopupComponent,
    FontAwesomeModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  readonly facade = inject(FoodFacade);
  utensilsIcon = faUtensils;

  ngOnDestroy(): void {
    this.facade.destroy();
  }
}
