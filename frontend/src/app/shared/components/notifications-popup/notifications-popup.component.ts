import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NotificationService } from "../../../core/services/notification.service";

@Component({
  selector: "app-notifications-popup",
  standalone: true,
  templateUrl: "./notifications-popup.component.html",
  styleUrl: "./notifications-popup.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPopupComponent {
  readonly notificationsService = inject(NotificationService);
}
