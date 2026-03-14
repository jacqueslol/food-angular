import { Injectable, signal } from "@angular/core";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  readonly notifications = signal<AppNotification[]>([]);

  success(message: string): void {
    this.push("success", message);
  }

  error(message: string): void {
    this.push("error", message);
  }

  info(message: string): void {
    this.push("info", message);
  }

  warning(message: string): void {
    this.push("warning", message);
  }

  remove(id: string): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }

  private push(type: NotificationType, message: string): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.notifications.update((items) => [...items, { id, type, message }]);
    window.setTimeout(() => this.remove(id), 3500);
  }
}
