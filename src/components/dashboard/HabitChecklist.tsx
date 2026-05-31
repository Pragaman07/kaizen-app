"use client";

import Link from "next/link";

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
  subtext?: string;
  href?: string;
}

const HABITS: readonly HabitDefinition[] = [
  { field: "workout_done", label: "Workout", manual: false, href: "/workout" },
  { field: "nutrition_done", label: "Nutrition", manual: true, subtext: "Sattu, 3-4 eggs, green moong & chana bowl", href: "/nutrition" },
  { field: "night_routine_done", label: "Night Routine", manual: true, subtext: "500ml milk, walnuts & nut mix", href: "/night-routine" },
  { field: "supplements_done", label: "Supplements", manual: true, subtext: "Creatine (3-5g), Whey, Omega-3, D3, B12", href: "/supplements" },
] as const;

export interface HabitChecklistProps {
  dailyTracking: DailyTracking;
  habitPlan?: any;
  onToggle: (field: DailyHabitField, value: boolean) => void;
}

export default function HabitChecklist({
  dailyTracking,
  habitPlan,
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
        {HABITS.map(({ field, label, subtext, href }) => {
          const checked = dailyTracking[field];
          let displaySubtext = subtext;
          
          // Dynamically override from habitPlan if available
          if (habitPlan) {
            if (field === "nutrition_done") displaySubtext = habitPlan.nutrition_text || "Set targets in Plan Builder";
            if (field === "supplements_done") displaySubtext = habitPlan.supplements_text || "Set targets in Plan Builder";
            if (field === "night_routine_done") displaySubtext = habitPlan.night_routine_text || "Set targets in Plan Builder";
          }

          return (
            <li key={field}>
              <Link
                href={href || "#"}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md px-1 py-2 transition-colors hover:bg-gray-50",
                )}
              >
                <div className="pt-0.5">
                  <Checkbox
                    checked={checked}
                    disabled={true}
                    className={cn(
                      "size-5 rounded-[4px] border-border opacity-100",
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
                </div>
                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-base text-foreground",
                      checked && "text-zinc-400 line-through",
                    )}
                  >
                    {label}
                  </span>
                  {displaySubtext && (
                    <span className={cn(
                      "text-sm text-[#888780]",
                      checked && "text-zinc-400 line-through"
                    )}>
                      {displaySubtext}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
