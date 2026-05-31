import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, anonKey };
}

export function createSupabaseClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey);
}

export const supabase: SupabaseClient<Database> = createSupabaseClient();
