import type {
  DailyTracking,
  MasterExercise,
  SetLogInsert,
  TrackingType,
  UserStats,
} from "@/types/database.types";

/**
 * Metrics mutated during an active workout session (Vault B).
 * Maps 1:1 to set_logs columns before workout_log_id is attached.
 */
export type WorkoutMetricField = "reps" | "weight" | "duration_seconds";

/** Client-side set entry held in useWorkoutStore.workoutData */
export interface WorkoutSetEntry {
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  duration_seconds: number;
}

/** Payload row for Supabase bulk insert into set_logs (includes FK) */
export type SetLogBulkRow = Pick<
  SetLogInsert,
  | "workout_log_id"
  | "exercise_id"
  | "set_number"
  | "reps"
  | "weight"
  | "duration_seconds"
>;

/** Profile option for the Netflix-style switcher */
export interface ProfileOption {
  id: string;
  name: string;
}

/** Boolean pillars on daily_tracking that HabitChecklist can toggle */
export type DailyHabitField =
  | "workout_done"
  | "nutrition_done"
  | "night_routine_done"
  | "supplements_done";

/** Manually toggled habits (workout_done is system-driven per PRD) */
export type ManualDailyHabitField = Exclude<
  DailyHabitField,
  "workout_done"
>;

export interface DashboardData {
  userStats: UserStats | null;
  dailyTracking: DailyTracking;
}

/** Plan builder row held in local draft state before batch save */
export interface PlanBuilderExerciseDraft {
  /** Stable React list key (client-only) */
  clientKey: string;
  /** Present when loaded from DB or after first save */
  id?: string;
  exercise_name: string;
  tracking_type: TrackingType;
  target_sets: number;
  default_weight: number;
  safety_note: string;
}

export function masterExerciseToDraft(
  row: MasterExercise,
): PlanBuilderExerciseDraft {
  return {
    clientKey: row.id,
    id: row.id,
    exercise_name: row.exercise_name,
    tracking_type: row.tracking_type,
    target_sets: row.target_sets,
    default_weight: row.default_weight,
    safety_note: row.safety_note ?? "",
  };
}

export function createEmptyExerciseDraft(): PlanBuilderExerciseDraft {
  return {
    clientKey: crypto.randomUUID(),
    exercise_name: "",
    tracking_type: "reps",
    target_sets: 3,
    default_weight: 0,
    safety_note: "",
  };
}
