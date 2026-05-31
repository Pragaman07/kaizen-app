"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { DailyHabitField } from "@/types/app.types";
import type { DailyTracking } from "@/types/database.types";

const KAIZEN_TEAL = "#1D9E75";
const TEAL_MIST = "#E1F5EE";

interface HabitDefinition {
  field: DailyHabitField;
  label: string;
  manual: boolean;
}

const HABITS: readonly HabitDefinition[] = [
  { field: "workout_done", label: "Workout", manual: false },
  { field: "nutrition_done", label: "Nutrition", manual: true },
  { field: "night_routine_done", label: "Night Routine", manual: true },
  { field: "supplements_done", label: "Supplements", manual: true },
] as const;

export interface HabitChecklistProps {
  dailyTracking: DailyTracking;
  onToggle: (field: DailyHabitField, value: boolean) => void;
}

export default function HabitChecklist({
  dailyTracking,
  onToggle,
}: HabitChecklistProps) {
  return (
    <section
      className="rounded-lg border border-border bg-card p-5 shadow-sm"
      aria-labelledby="habit-checklist-heading"
    >
      <h2
        id="habit-checklist-heading"
        className="font-heading text-xl text-primary"
      >
        Today&apos;s pillars
      </h2>
      <ul className="mt-4 space-y-3">
        {HABITS.map(({ field, label, manual }) => {
          const checked = dailyTracking[field];
          return (
            <li key={field}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 transition-colors",
                  !manual && "cursor-default opacity-90",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={!manual}
                  onCheckedChange={(next) => {
                    if (!manual) return;
                    onToggle(field, next === true);
                  }}
                  className={cn(
                    "size-5 rounded-[4px] border-border",
                    checked &&
                      "border-[#1D9E75] bg-[#E1F5EE] text-[#1D9E75] data-checked:border-[#1D9E75] data-checked:bg-[#E1F5EE] data-checked:text-[#1D9E75]",
                  )}
                  style={
                    checked
                      ? {
                          borderColor: KAIZEN_TEAL,
                          backgroundColor: TEAL_MIST,
                          color: KAIZEN_TEAL,
                        }
                      : undefined
                  }
                  aria-label={label}
                />
                <span
                  className={cn(
                    "text-base text-foreground",
                    checked && "text-zinc-400 line-through",
                  )}
                >
                  {label}
                </span>
                {!manual ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Auto on workout complete
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
