import { getProfile, saveProfile } from "@/lib/db";
import { json, readJson, requireUser } from "@/lib/api";
import { DEFAULT_READING_PREFS, type ReadingPrefs } from "@/lib/types";

export async function POST(req: Request) {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const b = await readJson<{ sound?: boolean; readingPrefs?: Partial<ReadingPrefs> }>(req);
  const p = await getProfile(u.id);
  if (typeof b?.sound === "boolean") p.sound = b.sound;
  if (b?.readingPrefs) {
    const r = b.readingPrefs;
    const cur = { ...DEFAULT_READING_PREFS, ...p.readingPrefs };
    p.readingPrefs = {
      font: r.font && ["jakarta", "lexend", "serif"].includes(r.font) ? r.font : cur.font,
      size: r.size && ["m", "l", "xl"].includes(r.size) ? r.size : cur.size,
      spacing: r.spacing && ["normal", "wide"].includes(r.spacing) ? r.spacing : cur.spacing,
      colorLines: typeof r.colorLines === "boolean" ? r.colorLines : cur.colorLines,
    };
  }
  await saveProfile(p);
  return json({ ok: true, sound: p.sound, readingPrefs: p.readingPrefs });
}
