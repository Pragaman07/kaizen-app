"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkoutStore } from "@/lib/store/useWorkoutStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { MasterExercise } from "@/types/database.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitWorkoutSession } from "@/lib/supabase/queries";

export function WizardWrapper({ exercises }: { exercises: MasterExercise[] }) {
  const router = useRouter();
  const { activeUserId } = useUserStore();
  const { 
    currentStepIndex, 
    workoutData, 
    initWorkout, 
    setMetric, 
    nextStep, 
    prevStep, 
    clearStore 
  } = useWorkoutStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [safetyCleared, setSafetyCleared] = useState(false);

  useEffect(() => {
    initWorkout(exercises);
    return () => clearStore();
  }, [exercises, initWorkout, clearStore]);

  useEffect(() => {
    setSafetyCleared(false);
  }, [currentStepIndex]);

  if (!exercises || exercises.length === 0) return null;
  if (workoutData.length === 0) return null;

  const activeExercise = exercises[currentStepIndex];
  const isLastStep = currentStepIndex === exercises.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const currentSets = workoutData.filter(d => d.exercise_id === activeExercise.id);

  const handleNextOrSave = async () => {
    if (isLastStep) {
      if (!activeUserId) return;
      setIsSubmitting(true);
      try {
        await submitWorkoutSession(activeUserId, activeExercise.day_of_week, workoutData);
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to save workout:", error);
        alert("Failed to save workout session.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const hasSafetyNote = Boolean(activeExercise.safety_note && activeExercise.safety_note.trim().length > 0);
  const showInputs = !hasSafetyNote || safetyCleared;

  return (
    <div className="max-w-xl mx-auto w-full p-4 md:p-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{activeExercise.exercise_name}</h2>
        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-600 self-start md:self-auto">
          {currentStepIndex + 1} / {exercises.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          {!showInputs ? (
            <div className="flex flex-col items-center justify-center p-6 bg-[#EF9F27]/10 border border-[#EF9F27]/30 rounded-2xl mb-10">
              <span className="text-4xl mb-4">⚠️</span>
              <h3 className="text-xl font-bold text-[#B37011] mb-2 text-center">Safety Note</h3>
              <p className="text-[#B37011] font-medium text-center mb-6">{activeExercise.safety_note}</p>
              <Button
                onClick={() => setSafetyCleared(true)}
                className="w-full md:w-auto px-8 py-6 text-lg bg-[#EF9F27] hover:bg-[#D98F22] text-white font-bold rounded-xl shadow-sm"
              >
                I Understand
              </Button>
            </div>
          ) : (
            <>
              {activeExercise.safety_note && (
                <div className="mb-8 p-4 rounded-xl bg-[#EF9F27]/10 border border-[#EF9F27]/30 text-[#B37011] text-sm font-medium shadow-sm flex items-center">
                  ⚠️ <span className="ml-2">{activeExercise.safety_note}</span>
                </div>
              )}

              <div className="space-y-4 mb-10">
                <div className="grid grid-cols-3 gap-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                  <div className="text-left">Set</div>
                  <div>{activeExercise.tracking_type === "time" ? "Seconds" : activeExercise.tracking_type === "volume" ? "Volume" : "Reps"}</div>
                  <div>Weight (lbs)</div>
                </div>

                {currentSets.map((set) => (
                  <div key={`${set.exercise_id}-${set.set_number}`} className="grid grid-cols-3 gap-4 items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="font-bold text-gray-700 pl-4 text-lg">{set.set_number}</div>
                    
                    <Input
                      type="number"
                      min={0}
                      value={
                        activeExercise.tracking_type === "time" ? set.duration_seconds || "" : set.reps || ""
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setMetric(
                          activeExercise.id, 
                          set.set_number, 
                          activeExercise.tracking_type === "time" ? "duration_seconds" : "reps", 
                          val
                        );
                      }}
                      className="text-center text-xl font-bold py-6 bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:border-[#1D9E75] rounded-xl"
                    />

                    <Input
                      type="number"
                      min={0}
                      value={set.weight || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setMetric(activeExercise.id, set.set_number, "weight", val);
                      }}
                      className="text-center text-xl font-bold py-6 bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:border-[#1D9E75] rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-6 border-t border-gray-100 mt-auto relative z-10">
        <Button
          onClick={prevStep}
          disabled={isFirstStep || isSubmitting}
          className="flex-1 py-7 text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-2xl disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextOrSave}
          disabled={isSubmitting || !showInputs}
          className="flex-[2] py-7 text-lg bg-[#1D9E75] text-white hover:bg-[#16825f] font-bold shadow-md rounded-2xl disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
        >
          {isSubmitting ? "Saving..." : isLastStep ? "Finish & Save Workout" : "Next Exercise"}
        </Button>
      </div>
    </div>
  );
}