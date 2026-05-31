"use client";

import { useEffect, useState } from "react";
import { useUserStore, useUserStoreHydrated } from "@/lib/store/useUserStore";
import { fetchDayPlan, saveDayPlan } from "@/lib/supabase/queries";
import { seedPragamanPlan } from "@/lib/supabase/seedPlan";
import { MasterExerciseInsert } from "@/types/database.types";
import { BuilderInputRow } from "@/components/admin/BuilderInputRow";
import { Button } from "@/components/ui/button";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function PlanBuilderPage() {
  const isHydrated = useUserStoreHydrated();
  const { activeUserId } = useUserStore();
  
  const [activeDay, setActiveDay] = useState<string>("MON");
  const [draftPlan, setDraftPlan] = useState<MasterExerciseInsert[]>([]);
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
          // ensure tracking_type has a default if missing
          const safePlan = plan.map(e => ({
            ...e,
            tracking_type: e.tracking_type || "reps"
          }));
          setDraftPlan(safePlan);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch plan:", err);
      })
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
      alert("Plan Loaded!");
      const plan = await fetchDayPlan(activeUserId, activeDay);
      const safePlan = plan.map(e => ({
        ...e,
        tracking_type: e.tracking_type || "reps"
      }));
      setDraftPlan(safePlan);
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

    // Validation
    const invalid = draftPlan.find(
      (e) => !e.exercise_name.trim() || e.target_sets < 1
    );
    if (invalid) {
      alert("Validation Error: Please ensure all exercises have a name and at least 1 set.");
      return;
    }

    setIsSaving(true);
    try {
      await saveDayPlan(activeUserId, activeDay, draftPlan);
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
        <h1 className="text-2xl font-bold mb-6 text-black">Plan Builder</h1>

        <Button
          onClick={handleSeed}
          disabled={isLoading || isSaving}
          className="mb-6 w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-black text-lg font-bold rounded-xl shadow-md"
        >
          ⚡️ Auto-Load Master Plan
        </Button>

        {/* Segmented Controller */}
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

        {/* Exercises List */}
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

        {/* Add Button */}
        <button
          onClick={handleAddExercise}
          className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 hover:text-black transition-colors"
        >
          + Add Exercise
        </button>
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