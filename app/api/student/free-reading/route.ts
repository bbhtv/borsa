import { getProfile, saveProfile } from "@/lib/db";
import { json, readJson, requireUser } from "@/lib/api";

/** Free reading of the student's own text – counted as practice time, not as a measurement. */
export async function POST(req: Request) {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const b = await readJson<{ words?: number; seconds?: number }>(req);
  const words = Math.max(0, Math.min(20000, Math.round(Number(b?.words) || 0)));
  const seconds = Math.max(0, Math.min(4 * 3600, Math.round(Number(b?.seconds) || 0)));
  const p = await getProfile(u.id);
  const fr = p.freeReading || { seconds: 0, words: 0, sessions: 0 };
  p.freeReading = { seconds: fr.seconds + seconds, words: fr.words + words, sessions: fr.sessions + 1 };
  p.totalSeconds += seconds;
  await saveProfile(p);
  return json({ freeReading: p.freeReading });
}
