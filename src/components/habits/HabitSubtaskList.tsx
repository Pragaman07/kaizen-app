"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUserStore, useUserStoreHydrated } from "@/lib/store/useUserStore";
import { fetchDashboardData, toggleDailyHabit, fetchHabitPlan } from "@/lib/supabase/queries";
import type { DailyHabitField } from "@/types/app.types";

const KAIZEN_TEAL = "#1D9E75";
const TEAL_MIST = "#E1F5EE";
const CHARCOAL = "#2C2C2A";

interface HabitSubtaskListProps {
  title: string;
  field: DailyHabitField;
  textKey: "nutrition_text" | "supplements_text" | "night_routine_text";
  defaultSubtasks: string[];
}

export function HabitSubtaskList({ title, field, textKey, defaultSubtasks }: HabitSubtaskListProps) {
  const router = useRouter();
  const isHydrated = useUserStoreHydrated();
  const { activeUserId } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  // Track individual subtask completion internally
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set());
  const [isPillarDone, setIsPillarDone] = useState(false);

  const [subtasks, setSubtasks] = useState<string[]>([]);

  useEffect(() => {
    if (!activeUserId) return;
    
    let isMounted = true;
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const todayStr = days[new Date().getDay()];

    Promise.all([
      fetchDashboardData(activeUserId),
      fetchHabitPlan(activeUserId, todayStr)
    ]).then(([data, habitPlan]) => {
      if (!isMounted) return;

      // Resolve subtasks from plan or fallback
      let dynamicSubtasks = defaultSubtasks;
      if (habitPlan && habitPlan[textKey]) {
        dynamicSubtasks = habitPlan[textKey]!.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      setSubtasks(dynamicSubtasks);

      if (data.dailyTracking) {
        setTrackingId(data.dailyTracking.id);
        const done = data.dailyTracking[field];
        setIsPillarDone(done);
        if (done) {
          // If the pillar is already done, check off all subtasks
          setCompletedIndexes(new Set(dynamicSubtasks.map((_, i) => i)));
        }
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("Failed to load habit data:", err);
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [activeUserId, field, textKey, defaultSubtasks]);

  const toggleSubtask = async (index: number) => {
    if (isSaving || !trackingId) return;

    const nextSet = new Set(completedIndexes);
    const isUnchecking = nextSet.has(index);

    if (isUnchecking) {
      nextSet.delete(index);
    } else {
      nextSet.add(index);
    }

    // Determine if the overall pillar status is changing
    const wasDone = isPillarDone;
    const isNowDone = nextSet.size === subtasks.length;

    setCompletedIndexes(nextSet);

    if (isNowDone !== wasDone) {
      setIsSaving(true);
      try {
        await toggleDailyHabit(trackingId, field, isNowDone);
        setIsPillarDone(isNowDone);
      } catch (err) {
        console.error("Failed to mark pillar status:", err);
        // Rollback
        if (isUnchecking) {
          nextSet.add(index);
        } else {
          nextSet.delete(index);
        }
        setCompletedIndexes(new Set(nextSet));
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isHydrated || isLoading) {
    return <div className="min-h-screen bg-gray-50 p-4" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-[#888780] hover:text-[#2C2C2A] transition-colors mb-6"
        >
          <ChevronLeft className="size-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <h1 className="font-heading text-3xl text-primary mb-2">{title}</h1>
        <p className="text-[#888780] mb-8">Complete all sub-tasks to mark this pillar as done.</p>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border space-y-4">
          {subtasks.map((task, idx) => {
            const checked = completedIndexes.has(idx);
            return (
              <label 
                key={idx}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                  checked ? "border-[#1D9E75] bg-[#E1F5EE]" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="pt-0.5">
                  <Checkbox
                    checked={checked}
                    disabled={isSaving}
                    onCheckedChange={() => toggleSubtask(idx)}
                    className={cn(
                      "size-6 rounded-[6px] border-gray-300",
                      checked && "border-[#1D9E75] bg-[#1D9E75] text-white"
                    )}
                    style={checked ? { backgroundColor: KAIZEN_TEAL, borderColor: KAIZEN_TEAL } : undefined}
                  />
                </div>
                <div className="flex-1">
                  <span className={cn(
                    "text-lg transition-colors font-medium",
                    checked ? "text-[#1D9E75] line-through opacity-80" : "text-[#2C2C2A]"
                  )}>
                    {task}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {isPillarDone && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center justify-center p-6 bg-[#E1F5EE] rounded-2xl border border-[#1D9E75] text-center">
            <div className="size-12 bg-[#1D9E75] rounded-full flex items-center justify-center mb-3">
              <Check className="size-6 text-white" />
            </div>
            <h3 className="font-heading text-xl text-[#1D9E75] mb-1">Pillar Completed</h3>
            <p className="text-[#1D9E75] opacity-80 text-sm">Great job sticking to the discipline.</p>
            <button 
              onClick={() => router.push("/dashboard")}
              className="mt-6 px-6 py-2 bg-[#1D9E75] hover:bg-[#16825f] text-white rounded-full font-medium transition-colors"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
