import { MealPlannerDay, Recipe, RecipeDraft } from "../../../core/models/food.models";

export function createEmptyRecipeDraft(): RecipeDraft {
  return {
    details: {
      name: "New Recipe",
      serves: 1,
      servesText: "portion(s)",
      tags: [],
      prepTime: 30,
      creator: "Jacques Louw"
    },
    ingredients: [],
    steps: [],
    video: "",
    videoFormat: "mp4",
    img: ""
  };
}

export function cloneRecipe(recipe: Recipe | RecipeDraft): RecipeDraft {
  return JSON.parse(JSON.stringify(recipe)) as RecipeDraft;
}

export function getWeekIdentifier(date = new Date()): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${weekNo}`;
}

export function buildWeekDays(weekIdentifier: string, existingDays: MealPlannerDay[]): MealPlannerDay[] {
  const [yearPart, weekPart] = weekIdentifier.split("-W");
  const year = Number(yearPart);
  const weekNumber = Number(weekPart);
  const monday = new Date(year, 0, 1 + (weekNumber - 1) * 7);

  while (monday.getDay() !== 1) {
    monday.setDate(monday.getDate() - 1);
  }

  const week: MealPlannerDay[] = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const isoDate = date.toISOString().split("T")[0] ?? "";
    const fromDb = existingDays.find((day) => day.id === isoDate);

    if (fromDb) {
      week.push(fromDb);
      continue;
    }

    const split = date.toDateString().split(" ");
    week.push({
      id: isoDate,
      day: split[0] ?? "",
      dateMonth: `${split[2] ?? ""} ${split[1] ?? ""}`.trim(),
      year: split[3] ?? "",
      breakfast: [],
      lunch: [],
      dinner: []
    });
  }

  return week;
}

export function formatCountdown(secondsLeft: number): string {
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = Math.floor(secondsLeft % 60);
  const paddedMinutes = hours > 0 && minutes < 10 ? `0${minutes}` : `${minutes}`;
  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${hours > 0 ? `${hours}:` : ""}${paddedMinutes}:${paddedSeconds}`;
}
