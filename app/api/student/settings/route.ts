import { getProfile, saveProfile } from "@/lib/db";
import { json, readJson, requireUser } from "@/lib/api";

export async function POST(req: Request) {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const b = await readJson<{ sound?: boolean }>(req);
  const p = await getProfile(u.id);
  if (typeof b?.sound === "boolean") p.sound = b.sound;
  await saveProfile(p);
  return json({ ok: true, sound: p.sound });
}
