import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\n]+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="?([^"\n]+)/)?.[1]?.trim();

const userId = "11111111-1111-1111-1111-111111111111";
const date = "2026-05-31";
const supabase = createClient(url, key);

const row = {
  user_id: userId,
  date,
  workout_done: false,
  nutrition_done: false,
  night_routine_done: false,
  supplements_done: false,
  freeze_used: false,
};

const upsert = await supabase
  .from("daily_tracking")
  .upsert(row, { onConflict: "user_id,date" })
  .select("*")
  .single();

console.log("upsert", upsert.error ?? upsert.data);
