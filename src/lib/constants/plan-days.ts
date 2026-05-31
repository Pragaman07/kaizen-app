/** PRD pill labels map to full `master_exercises.day_of_week` values */
export const PLAN_DAY_PILLS = [
  { pill: "MON", dayOfWeek: "Monday" },
  { pill: "TUE", dayOfWeek: "Tuesday" },
  { pill: "WED", dayOfWeek: "Wednesday" },
  { pill: "THU", dayOfWeek: "Thursday" },
  { pill: "FRI", dayOfWeek: "Friday" },
  { pill: "SAT", dayOfWeek: "Saturday" },
  { pill: "SUN", dayOfWeek: "Sunday" },
] as const;

export type PlanDayPill = (typeof PLAN_DAY_PILLS)[number]["pill"];
export type DayOfWeek = (typeof PLAN_DAY_PILLS)[number]["dayOfWeek"];

export function dayOfWeekFromPill(pill: PlanDayPill): DayOfWeek {
  const match = PLAN_DAY_PILLS.find((entry) => entry.pill === pill);
  return match?.dayOfWeek ?? "Monday";
}

export function pillFromDayOfWeek(day: string): PlanDayPill {
  const match = PLAN_DAY_PILLS.find((entry) => entry.dayOfWeek === day);
  return match?.pill ?? "MON";
}
