import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\n]+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="?([^"\n]+)/)?.[1]?.trim();

const expected = [
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
];

const res = await fetch(
  `${url.replace(/\/$/, "")}/rest/v1/users?select=id,name&id=in.(${expected.join(",")})`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);

if (!res.ok) {
  console.log(JSON.stringify({ ok: false, status: res.status }));
  process.exit(1);
}

const rows = await res.json();
const found = rows.map((r) => r.id);
const missing = expected.filter((id) => !found.includes(id));
console.log(
  JSON.stringify({
    ok: true,
    profiles: rows.map((r) => ({ id: r.id, name: r.name })),
    missingIds: missing,
  }),
);
