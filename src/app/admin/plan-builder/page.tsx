"use client";

import { useEffect, useState } from "react";
import { useUserStore, useUserStoreHydrated } from "@/lib/store/useUserStore";
import { fetchDayPlan, saveDayPlan, fetchHabitPlan, saveHabitPlan } from "@/lib/supabase/queries";
import { seedPragamanPlan, seedPragamanHabits } from "@/lib/supabase/seedPlan";
import { MasterExerciseInsert, MasterHabitInsert } from "@/types/database.types";
import { BuilderInputRow } from "@/components/admin/BuilderInputRow";
import { Button } from "@/components/ui/button";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function PlanBuilderPage() {
  const isHydrated = useUserStoreHydrated();
  const { activeUserId } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<"workout" | "habits">("workout");
  const [activeDay, setActiveDay] = useState<string>("MON");
  const [draftPlan, setDraftPlan] = useState<MasterExerciseInsert[]>([]);
  const [draftHabits, setDraftHabits] = useState<MasterHabitInsert>({
    user_id: "",
    day_of_week: "MON",
    nutrition_text: "",
    supplements_text: "",
    night_routine_text: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!activeUserId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchDayPlan(activeUserId, activeDay)
      .then((plan) => {
        if (isMounted) {
          const safePlan = plan.map(e => ({
            ...e,
            tracking_type: e.tracking_type || "reps"
          }));
          setDraftPlan(safePlan);
        }
      })
      .catch((err) => console.error("Failed to fetch workout plan:", err));

    fetchHabitPlan(activeUserId, activeDay)
      .then((habit) => {
        if (isMounted) {
          if (habit) {
            setDraftHabits(habit);
          } else {
            setDraftHabits({
              user_id: activeUserId,
              day_of_week: activeDay,
              nutrition_text: "",
              supplements_text: "",
              night_routine_text: "",
            });
          }
        }
      })
      .catch((err) => console.error("Failed to fetch habit plan:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUserId, activeDay]);

  const handleSeed = async () => {
    if (!activeUserId) return;
    setIsLoading(true);
    try {
      await seedPragamanPlan(activeUserId);
      await seedPragamanHabits(activeUserId);
      alert("Plan & Habits Loaded!");
      
      const plan = await fetchDayPlan(activeUserId, activeDay);
      const safePlan = plan.map(e => ({
        ...e,
        tracking_type: e.tracking_type || "reps"
      }));
      setDraftPlan(safePlan);

      const habit = await fetchHabitPlan(activeUserId, activeDay);
      if (habit) setDraftHabits(habit);
    } catch (err) {
      console.error(err);
      alert("Failed to seed plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = () => {
    setDraftPlan((prev) => [
      ...prev,
      {
        exercise_name: "",
        tracking_type: "reps",
        target_sets: 3,
        default_weight: 0,
        safety_note: "",
        day_of_week: activeDay,
        user_id: activeUserId!,
      },
    ]);
  };

  const handleUpdateExercise = (index: number, updated: MasterExerciseInsert) => {
    setDraftPlan((prev) => {
      const newPlan = [...prev];
      newPlan[index] = updated;
      return newPlan;
    });
  };

  const handleDeleteExercise = (index: number) => {
    setDraftPlan((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!activeUserId) return;

    if (activeTab === "workout") {
      const invalid = draftPlan.find(
        (e) => !e.exercise_name.trim() || e.target_sets < 1
      );
      if (invalid) {
        alert("Validation Error: Please ensure all exercises have a name and at least 1 set.");
        return;
      }
    }

    setIsSaving(true);
    try {
      if (activeTab === "workout") {
        await saveDayPlan(activeUserId, activeDay, draftPlan);
      } else {
        await saveHabitPlan(activeUserId, activeDay, {
          ...draftHabits,
          user_id: activeUserId,
          day_of_week: activeDay
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save plan:", err);
      alert("Failed to save plan. See console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated) return null;

  if (!activeUserId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-[#EF9F27] text-white p-4 rounded-xl shadow-md font-semibold text-center">
          Please select a profile from the Dashboard first.
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24 bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="font-heading text-3xl mb-6 text-black">Plan Builder</h1>

        <Button
          onClick={handleSeed}
          disabled={isLoading || isSaving}
          className="mb-6 w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-black text-lg font-bold rounded-xl shadow-md"
        >
          ⚡️ Auto-Load Master Plan & Habits
        </Button>

        {/* Top Level Segmented Controller */}
        <div className="flex bg-white rounded-full p-1 shadow-sm mb-6 border border-gray-200">
          <button
            onClick={() => setActiveTab("workout")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "workout"
                ? "bg-[#1A2237] text-white shadow"
                : "text-gray-500 hover:text-black hover:bg-gray-100"
            }`}
          >
            Workout Plan
          </button>
          <button
            onClick={() => setActiveTab("habits")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "habits"
                ? "bg-[#1A2237] text-white shadow"
                : "text-gray-500 hover:text-black hover:bg-gray-100"
            }`}
          >
            Habits Plan
          </button>
        </div>

        {/* Days Segmented Controller */}
        <div className="flex bg-white rounded-full p-1 shadow-sm mb-6 overflow-x-auto border border-gray-200">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeDay === day
                  ? "bg-[#1D9E75] text-white shadow"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {activeTab === "workout" ? (
          <>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10 text-gray-400">Loading plan...</div>
              ) : draftPlan.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl">
                  No exercises planned for {activeDay}.
                </div>
              ) : (
                draftPlan.map((exercise, index) => (
                  <BuilderInputRow
                    key={exercise.id || `draft-${index}`}
                    exercise={exercise}
                    onChange={(updated) => handleUpdateExercise(index, updated)}
                    onDelete={() => handleDeleteExercise(index)}
                  />
                ))
              )}
            </div>

            <button
              onClick={handleAddExercise}
              className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 hover:text-black transition-colors"
            >
              + Add Exercise
            </button>
          </>
        ) : (
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400">Loading habits...</div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nutrition Target</label>
                  <textarea 
                    value={draftHabits.nutrition_text || ""}
                    onChange={(e) => setDraftHabits({ ...draftHabits, nutrition_text: e.target.value })}
                    className="w-full min-h-[80px] p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75] outline-none transition-all"
                    placeholder="e.g. Sattu, 3-4 eggs, green moong"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate items with commas to create individual checkboxes.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplements Target</label>
                  <textarea 
                    value={draftHabits.supplements_text || ""}
                    onChange={(e) => setDraftHabits({ ...draftHabits, supplements_text: e.target.value })}
                    className="w-full min-h-[80px] p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75] outline-none transition-all"
                    placeholder="e.g. Creatine, Whey Protein"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate items with commas to create individual checkboxes.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Night Routine Target</label>
                  <textarea 
                    value={draftHabits.night_routine_text || ""}
                    onChange={(e) => setDraftHabits({ ...draftHabits, night_routine_text: e.target.value })}
                    className="w-full min-h-[80px] p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75] outline-none transition-all"
                    placeholder="e.g. 500ml milk, walnuts"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate items with commas to create individual checkboxes.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className={`w-full py-6 text-lg font-bold rounded-xl transition-all ${
              saveSuccess
                ? "bg-[#1D9E75] text-white"
                : "bg-[#1D9E75] hover:bg-[#16825f] text-white"
            }`}
          >
            {isSaving
              ? "Saving..."
              : saveSuccess
              ? "Saved Successfully!"
              : `Save ${activeDay} Plan`}
          </Button>
        </div>
      </div>
    </div>
  );
}