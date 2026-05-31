import type { ProfileOption } from "@/types/app.types";

/** Profile IDs must match rows in Supabase `public.users` */
export const KAIZEN_PROFILES: readonly ProfileOption[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Pragaman",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Anjali",
  },
] as const;

export const DEFAULT_PROFILE_ID = KAIZEN_PROFILES[0].id;

export function isKnownProfileId(id: string | null | undefined): id is string {
  return (
    typeof id === "string" &&
    KAIZEN_PROFILES.some((profile) => profile.id === id)
  );
}
