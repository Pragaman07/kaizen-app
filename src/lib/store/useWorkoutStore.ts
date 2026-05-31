"use client";

import { create } from "zustand";
import type { WorkoutMetricField, WorkoutSetEntry } from "@/types/app.types";

interface WorkoutState {
  currentStepIndex: number;
  activeDay: string;
  workoutData: WorkoutSetEntry[];
  initWorkout: (exercises: import("@/types/database.types").MasterExercise[]) => void;
  updateMetric: (
    exerciseId: string,
    setNumber: number,
    metricType: WorkoutMetricField,
    delta: number,
  ) => void;
  setMetric: (
    exerciseId: string,
    setNumber: number,
    metricType: WorkoutMetricField,
    value: number,
  ) => void;
  nextStep: () => void;
  prevStep: () => void;
  clearStore: () => void;
}

const INITIAL_STATE = {
  currentStepIndex: 0,
  activeDay: "",
  workoutData: [] as WorkoutSetEntry[],
};

function clampMetric(
  metricType: WorkoutMetricField,
  value: number,
): number {
  if (metricType === "reps" || metricType === "duration_seconds") {
    return Math.max(0, value);
  }
  return Math.max(0, value);
}

export const useWorkoutStore = create<WorkoutState>()((set) => ({
  ...INITIAL_STATE,

  initWorkout: (exercises) => {
    const workoutData: WorkoutSetEntry[] = [];
    exercises.forEach((ex) => {
      for (let i = 1; i <= ex.target_sets; i++) {
        workoutData.push({
          exercise_id: ex.id,
          set_number: i,
          reps: 0,
          weight: ex.default_weight || 0,
          duration_seconds: 0,
        });
      }
    });
    set({ workoutData, currentStepIndex: 0, activeDay: exercises[0]?.day_of_week || "" });
  },

  updateMetric: (exerciseId, setNumber, metricType, delta) =>
    set((state) => ({
      workoutData: state.workoutData.map((entry) => {
        if (
          entry.exercise_id !== exerciseId ||
          entry.set_number !== setNumber
        ) {
          return entry;
        }
        const nextValue = clampMetric(
          metricType,
          entry[metricType] + delta,
        );
        return { ...entry, [metricType]: nextValue };
      }),
    })),

  setMetric: (exerciseId, setNumber, metricType, value) =>
    set((state) => ({
      workoutData: state.workoutData.map((entry) => {
        if (
          entry.exercise_id !== exerciseId ||
          entry.set_number !== setNumber
        ) {
          return entry;
        }
        return { ...entry, [metricType]: clampMetric(metricType, value) };
      }),
    })),

  nextStep: () =>
    set((state) => ({
      currentStepIndex: state.currentStepIndex + 1,
    })),

  prevStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
    })),

  clearStore: () => set({ ...INITIAL_STATE }),
}));
