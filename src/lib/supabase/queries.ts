import { supabase } from "@/lib/supabase/client";
import type { DailyHabitField, DashboardData } from "@/types/app.types";
import type { DailyTracking, Database, MasterExercise, MasterExerciseInsert, UserStats, SetLogInsert, MasterHabit, MasterHabitInsert } from "@/types/database.types";
import type { PostgrestError } from "@supabase/supabase-js";

const DAILY_HABIT_FIELDS: readonly DailyHabitField[] = [
  "workout_done",
  "nutrition_done",
  "night_routine_done",
  "supplements_done",
] as const;

export class DashboardQueryError extends Error {
  readonly cause: PostgrestError | null;

  constructor(message: string, cause: PostgrestError | null = null) {
    super(message);
    this.name = "DashboardQueryError";
    this.cause = cause;
  }
}

function isDailyHabitField(field: string): field is DailyHabitField {
  return (DAILY_HABIT_FIELDS as readonly string[]).includes(field);
}

/** Local calendar date as YYYY-MM-DD for daily_tracking.date */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapPostgrestError(
  message: string,
  error: PostgrestError | null,
): DashboardQueryError {
  return new DashboardQueryError(message, error);
}

async function fetchUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw mapPostgrestError("Failed to load user stats.", error);
  }

  return data;
}

type DailyTrackingInsertPayload =
  Database["public"]["Tables"]["daily_tracking"]["Insert"];

function buildTodayTrackingInsert(
  userId: string,
  date: string,
): DailyTrackingInsertPayload {
  return {
    user_id: userId,
    date,
    workout_done: false,
    nutrition_done: false,
    night_routine_done: false,
    supplements_done: false,
    freeze_used: false,
  };
}

async function fetchTodayTrackingRow(
  userId: string,
  date: string,
): Promise<DailyTracking | null> {
  const { data, error } = await supabase
    .from("daily_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) {
    throw mapPostgrestError("Failed to load today's tracking row.", error);
  }

  return data;
}

type DailyTrackingUpdatePayload =
  Database["public"]["Tables"]["daily_tracking"]["Update"];

function buildHabitUpdate(
  field: DailyHabitField,
  value: boolean,
): DailyTrackingUpdatePayload {
  switch (field) {
    case "workout_done":
      return { workout_done: value };
    case "nutrition_done":
      return { nutrition_done: value };
    case "night_routine_done":
      return { night_routine_done: value };
    case "supplements_done":
      return { supplements_done: value };
  }
}

function mapInitializeTrackingError(
  error: PostgrestError | null,
): DashboardQueryError {
  if (error?.code === "23503") {
    return new DashboardQueryError(
      "This profile is not linked to a valid user. Switch profiles using the menu in the header.",
      error,
    );
  }

  return mapPostgrestError("Failed to initialize today's tracking row.", error);
}

async function ensureTodayTracking(
  userId: string,
  date: string,
): Promise<DailyTracking> {
  const existing = await fetchTodayTrackingRow(userId, date);
  if (existing) return existing;

  const { data: upserted, error: upsertError } = await supabase
    .from("daily_tracking")
    .upsert(buildTodayTrackingInsert(userId, date), {
      onConflict: "user_id,date",
      ignoreDuplicates: false,
    })
    .select("*")
    .single();

  if (!upsertError && upserted) {
    return upserted;
  }

  if (upsertError?.code === "23505") {
    const raced = await fetchTodayTrackingRow(userId, date);
    if (raced) return raced;
  }

  throw mapInitializeTrackingError(upsertError);
}

export async function fetchDashboardData(
  userId: string,
): Promise<DashboardData> {
  const today = getLocalDateString();

  const [userStats, dailyTracking] = await Promise.all([
    fetchUserStats(userId),
    ensureTodayTracking(userId, today),
  ]);

  return { userStats, dailyTracking };
}

export async function toggleDailyHabit(
  trackingId: string,
  field: string,
  value: boolean,
): Promise<DailyTracking> {
  if (!isDailyHabitField(field)) {
    throw new DashboardQueryError(`Invalid habit field: ${field}`);
  }

  const { data, error } = await supabase
    .from("daily_tracking")
    .update(buildHabitUpdate(field, value))
    .eq("id", trackingId)
    .select("*")
    .single();

  if (error || !data) {
    throw mapPostgrestError("Failed to update daily habit.", error);
  }

  return data;
}

export async function fetchDayPlan(
  userId: string,
  dayOfWeek: string,
): Promise<MasterExercise[]> {
  const { data, error } = await supabase
    .from("master_exercises")
    .select("*")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);

  if (error) {
    throw mapPostgrestError(`Failed to load plan for ${dayOfWeek}.`, error);
  }

  return data || [];
}

export async function saveDayPlan(
  userId: string,
  dayOfWeek: string,
  exercises: MasterExerciseInsert[],
): Promise<MasterExercise[]> {
  const { data: existing } = await supabase
    .from("master_exercises")
    .select("id")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);

  const incomingIds = exercises.map((e) => e.id).filter(Boolean) as string[];
  const existingIds = (existing || []).map((e) => e.id);
  const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("master_exercises")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      throw mapPostgrestError("Failed to clean up old exercises.", deleteError);
    }
  }

  if (exercises.length > 0) {
    const { data: upserted, error: upsertError } = await supabase
      .from("master_exercises")
      .upsert(
        exercises.map((e) => ({
          ...e,
          user_id: userId,
          day_of_week: dayOfWeek,
        }))
      )
      .select("*");

    if (upsertError) {
      throw mapPostgrestError("Failed to save day plan.", upsertError);
    }

    return upserted || [];
  }

  return [];
}

export async function fetchTodayWorkout(
  userId: string,
  dayOfWeek: string,
): Promise<MasterExercise[]> {
  return fetchDayPlan(userId, dayOfWeek);
}

export async function fetchHabitPlan(userId: string, dayOfWeek: string): Promise<MasterHabit | null> {
  const { data, error } = await supabase
    .from("master_habits")
    .select("*")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch habit plan (table might not exist yet):", error.message);
    return null;
  }

  return data as MasterHabit | null;
}

export async function saveHabitPlan(userId: string, dayOfWeek: string, plan: MasterHabitInsert): Promise<void> {
  const { error } = await supabase
    .from("master_habits")
    .upsert(
      plan,
      { onConflict: 'user_id,day_of_week' }
    );

  if (error) {
    throw mapPostgrestError("Failed to save habit plan.", error);
  }
}

export async function submitWorkoutSession(
  userId: string,
  dayOfWeek: string,
  setsData: Pick<SetLogInsert, "exercise_id" | "set_number" | "reps" | "weight" | "duration_seconds">[],
): Promise<void> {
  const today = getLocalDateString();
  
  const { data: workoutLog, error: logError } = await supabase
    .from("workout_logs")
    .insert({
      user_id: userId,
      day_of_week: dayOfWeek,
    })
    .select("id")
    .single();

  if (logError || !workoutLog) {
    throw mapPostgrestError("Failed to create workout log.", logError);
  }

  const setLogsToInsert: SetLogInsert[] = setsData.map((set) => ({
    ...set,
    workout_log_id: workoutLog.id,
  }));

  if (setLogsToInsert.length > 0) {
    const { error: setsError } = await supabase
      .from("set_logs")
      .insert(setLogsToInsert);

    if (setsError) {
      throw mapPostgrestError("Failed to save set logs.", setsError);
    }
  }

  await ensureTodayTracking(userId, today);
  
  const { error: trackingError } = await supabase
    .from("daily_tracking")
    .update({ workout_done: true })
    .eq("user_id", userId)
    .eq("date", today);

  if (trackingError) {
    throw mapPostgrestError("Failed to update daily tracking.", trackingError);
  }
}

export async function fetchVolumeHistory(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = getLocalDateString(thirtyDaysAgo);

  const { data, error } = await supabase
    .from("workout_logs")
    .select(`
      id,
      day_of_week,
      completed_at,
      set_logs (
        reps,
        weight,
        duration_seconds,
        master_exercises (
          exercise_name,
          tracking_type
        )
      )
    `)
    .eq("user_id", userId)
    .gte("completed_at", thirtyDaysAgoStr);

  if (error) {
    throw mapPostgrestError("Failed to fetch volume history.", error);
  }

  return data || [];
}

export async function fetchAllDailyTracking(userId: string): Promise<DailyTracking[]> {
  const { data, error } = await supabase
    .from("daily_tracking")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw mapPostgrestError("Failed to fetch all daily tracking.", error);
  }

  return data || [];
}
