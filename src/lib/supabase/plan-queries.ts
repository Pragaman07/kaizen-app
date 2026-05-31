import { supabase } from "@/lib/supabase/client";
import type { PlanBuilderExerciseDraft } from "@/types/app.types";
import { masterExerciseToDraft } from "@/types/app.types";
import type { MasterExercise } from "@/types/database.types";
import type { Database } from "@/types/database.types";
import type { PostgrestError } from "@supabase/supabase-js";
import { DashboardQueryError } from "@/lib/supabase/queries";

type MasterExerciseInsertPayload =
  Database["public"]["Tables"]["master_exercises"]["Insert"];

function mapPlanError(
  message: string,
  error: PostgrestError | null,
): DashboardQueryError {
  return new DashboardQueryError(message, error);
}

function draftToUpsertRow(
  userId: string,
  dayOfWeek: string,
  draft: PlanBuilderExerciseDraft,
): MasterExerciseInsertPayload & { id: string } {
  return {
    id: draft.id ?? crypto.randomUUID(),
    user_id: userId,
    day_of_week: dayOfWeek,
    exercise_name: draft.exercise_name.trim(),
    tracking_type: draft.tracking_type,
    target_sets: draft.target_sets,
    default_weight: draft.default_weight,
    safety_note: draft.safety_note.trim() || null,
  };
}

export async function fetchDayPlan(
  userId: string,
  dayOfWeek: string,
): Promise<PlanBuilderExerciseDraft[]> {
  const { data, error } = await supabase
    .from("master_exercises")
    .select("*")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek)
    .order("exercise_name", { ascending: true });

  if (error) {
    throw mapPlanError("Failed to load plan for this day.", error);
  }

  return (data ?? []).map((row) => masterExerciseToDraft(row as MasterExercise));
}

export async function saveDayPlan(
  userId: string,
  dayOfWeek: string,
  exercises: PlanBuilderExerciseDraft[],
): Promise<MasterExercise[]> {
  const rows = exercises.map((draft) =>
    draftToUpsertRow(userId, dayOfWeek, draft),
  );
  const incomingIds = rows.map((row) => row.id);

  const { data: existing, error: existingError } = await supabase
    .from("master_exercises")
    .select("id")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);

  if (existingError) {
    throw mapPlanError("Failed to read existing plan before save.", existingError);
  }

  if (rows.length > 0) {
    const { data: upserted, error: upsertError } = await supabase
      .from("master_exercises")
      .upsert(rows, { onConflict: "id" })
      .select("*");

    if (upsertError) {
      throw mapPlanError("Failed to save exercises.", upsertError);
    }

    const orphanIds = (existing ?? [])
      .map((row) => row.id)
      .filter((id) => !incomingIds.includes(id));

    if (orphanIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("master_exercises")
        .delete()
        .in("id", orphanIds);

      if (deleteError) {
        throw mapPlanError(
          "Plan saved partially; failed to remove deleted exercises.",
          deleteError,
        );
      }
    }

    return (upserted ?? []) as MasterExercise[];
  }

  const orphanIds = (existing ?? []).map((row) => row.id);
  if (orphanIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("master_exercises")
      .delete()
      .in("id", orphanIds);

    if (deleteError) {
      throw mapPlanError("Failed to clear day plan.", deleteError);
    }
  }

  return [];
}
