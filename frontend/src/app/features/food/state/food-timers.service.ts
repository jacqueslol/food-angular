import { Injectable, OnDestroy, effect, signal } from "@angular/core";
import { GlobalTimer, RecipeId } from "../../../core/models/food.models";
import { formatCountdown } from "../utils/food.utils";

@Injectable({ providedIn: "root" })
export class FoodTimersService implements OnDestroy {
  private static readonly TIMER_STORAGE_KEY = "food.globalTimers";

  readonly globalTimers = signal<GlobalTimer[]>([]);

  private timerInterval: number | null = null;

  constructor() {
    this.restoreTimers();
    this.reconcileRestoredTimers();
    this.ensureTimerInterval();
    effect(() => {
      window.localStorage.setItem(
        FoodTimersService.TIMER_STORAGE_KEY,
        JSON.stringify(this.globalTimers())
      );
    });
  }

  ngOnDestroy(): void {
    this.clearTimerInterval();
  }

  addGlobalTimer(recipeId: RecipeId, recipeTitle: string, stepIndex: number, timerMins: number): void {
    if (timerMins <= 0) {
      return;
    }

    const timerId = `${recipeId}-${stepIndex + 1}`;
    const timer: GlobalTimer = {
      id: timerId,
      recipeId,
      recipeTitle,
      step: stepIndex + 1,
      durationSec: timerMins * 60,
      remainingSec: timerMins * 60,
      paused: false,
      endAtMs: Date.now() + timerMins * 60 * 1000
    };

    this.globalTimers.update((timers) => {
      const existingIndex = timers.findIndex((entry) => entry.id === timerId);
      if (existingIndex < 0) {
        return [...timers, timer];
      }
      const next = [...timers];
      next[existingIndex] = timer;
      return next;
    });

    this.ensureTimerInterval();
  }

  toggleTimerPause(timerId: string): void {
    const now = Date.now();
    this.globalTimers.update((timers) =>
      timers.map((timer) => {
        if (timer.id !== timerId) {
          return timer;
        }
        if (timer.paused) {
          if (timer.remainingSec <= 0) {
            return timer;
          }
          return {
            ...timer,
            paused: false,
            endAtMs: now + timer.remainingSec * 1000
          };
        }
        const remainingSec = this.computeRemainingSeconds(timer, now);
        return {
          ...timer,
          paused: true,
          remainingSec,
          endAtMs: null
        };
      })
    );
    this.ensureTimerInterval();
  }

  resetTimer(timerId: string): void {
    const now = Date.now();
    this.globalTimers.update((timers) =>
      timers.map((timer) =>
        timer.id === timerId
          ? {
              ...timer,
              remainingSec: timer.durationSec,
              paused: false,
              endAtMs: now + timer.durationSec * 1000
            }
          : timer
      )
    );
    this.ensureTimerInterval();
  }

  removeTimer(timerId: string): void {
    this.globalTimers.update((timers) => timers.filter((timer) => timer.id !== timerId));
    if (this.globalTimers().length === 0) {
      this.clearTimerInterval();
    }
  }

  formatTimer(seconds: number): string {
    return formatCountdown(seconds);
  }

  private ensureTimerInterval(): void {
    if (this.timerInterval !== null || !this.hasRunningTimers(this.globalTimers())) {
      return;
    }
    this.timerInterval = window.setInterval(() => {
      const now = Date.now();
      this.globalTimers.update((timers) => {
        const updated = timers.map((timer) => {
          if (timer.paused || timer.remainingSec === 0) {
            return timer;
          }
          const remainingSec = this.computeRemainingSeconds(timer, now);
          if (remainingSec === 0) {
            return { ...timer, remainingSec: 0, paused: true, endAtMs: null };
          }
          return { ...timer, remainingSec };
        });

        if (updated.every((timer) => timer.remainingSec === 0 || timer.paused)) {
          this.clearTimerInterval();
        }
        return updated;
      });
    }, 1000);
  }

  private clearTimerInterval(): void {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private restoreTimers(): void {
    try {
      const raw = window.localStorage.getItem(FoodTimersService.TIMER_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as GlobalTimer[];
      if (Array.isArray(parsed)) {
        this.globalTimers.set(parsed.filter(isGlobalTimerLike));
      }
    } catch {
      this.globalTimers.set([]);
    }
  }

  private reconcileRestoredTimers(): void {
    const now = Date.now();
    this.globalTimers.update((timers) =>
      timers.map((timer) => {
        if (timer.paused || timer.endAtMs === null) {
          return timer;
        }
        const remainingSec = this.computeRemainingSeconds(timer, now);
        if (remainingSec === 0) {
          return { ...timer, remainingSec: 0, paused: true, endAtMs: null };
        }
        return { ...timer, remainingSec };
      })
    );
  }

  private computeRemainingSeconds(timer: GlobalTimer, nowMs: number): number {
    if (timer.endAtMs === null) {
      return timer.remainingSec;
    }
    const msRemaining = timer.endAtMs - nowMs;
    if (msRemaining <= 0) {
      return 0;
    }
    return Math.ceil(msRemaining / 1000);
  }

  private hasRunningTimers(timers: GlobalTimer[]): boolean {
    return timers.some((timer) => !timer.paused && timer.remainingSec > 0);
  }
}

function isGlobalTimerLike(timer: unknown): timer is GlobalTimer {
  const candidate = timer as Partial<GlobalTimer> | null;
  return Boolean(
    candidate
      && typeof candidate.id === "string"
      && (typeof candidate.recipeId === "number" || typeof candidate.recipeId === "string")
      && typeof candidate.recipeTitle === "string"
      && typeof candidate.step === "number"
      && typeof candidate.durationSec === "number"
      && typeof candidate.remainingSec === "number"
      && typeof candidate.paused === "boolean"
      && (typeof candidate.endAtMs === "number" || candidate.endAtMs === null)
  );
}
