import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\n]+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="?([^"\n]+)/)?.[1]?.trim();

const urlOk = Boolean(url && /^https:\/\/.+\.supabase\.co\/?$/.test(url));
const jwtOk = Boolean(key && key.split(".").length === 3);
const typoPrefix = Boolean(key?.startsWith("yeyJ"));

console.log(JSON.stringify({ urlOk, jwtOk, typoPrefix, urlHost: url ? new URL(url).host : null }));

async function probeSupabase(apiKey, label) {
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/users?select=id,name&limit=2`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
  });
  console.log(JSON.stringify({ label, supabaseStatus: res.status, ok: res.ok }));
}

if (url && key && jwtOk && !typoPrefix) {
  await probeSupabase(key, "as_stored");
} else if (typoPrefix && url && key) {
  await probeSupabase(key, "as_stored_yeyJ");
  const fixed = `e${key.slice(1)}`;
  await probeSupabase(fixed, "eyJ_prefix_fix");
}
