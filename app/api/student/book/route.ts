import { randomUUID } from "crypto";
import { getProfile, saveProfile } from "@/lib/db";
import { fail, json, readJson, requireUser } from "@/lib/api";
import { dayDiff, dayKey } from "@/lib/engine";
import type { BookEntry } from "@/lib/types";

/** Log a real-book reading session measured with the timer. */
export async function POST(req: Request) {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const b = await readJson<{ title?: string; pages?: number; wordsPerPage?: number; seconds?: number }>(req);
  const pages = Math.round(Number(b?.pages));
  const wpp = Math.round(Number(b?.wordsPerPage));
  const seconds = Math.round(Number(b?.seconds));
  if (!(pages >= 1 && pages <= 500)) return fail("Okunan sayfa sayısı 1-500 arasında olmalı.");
  if (!(wpp >= 30 && wpp <= 800)) return fail("Sayfa başına kelime 30-800 arasında olmalı.");
  if (!(seconds >= 30 && seconds <= 6 * 3600)) return fail("Süre en az 30 saniye olmalı.");
  const wpm = Math.round((pages * wpp) / (seconds / 60));
  const entry: BookEntry = {
    id: randomUUID(),
    at: Date.now(),
    title: String(b?.title || "Kitap").trim().slice(0, 80) || "Kitap",
    pages,
    wordsPerPage: wpp,
    seconds,
    wpm,
  };
  const p = await getProfile(u.id);
  p.bookLog = [entry, ...(p.bookLog || [])].slice(0, 300);
  // reading a real book also keeps the streak alive
  const today = dayKey();
  if (p.lastActiveDay !== today) {
    p.streak = p.lastActiveDay && dayDiff(p.lastActiveDay, today) === 1 ? p.streak + 1 : 1;
    p.lastActiveDay = today;
  }
  await saveProfile(p);
  return json({ entry, bookLog: p.bookLog });
}

export async function DELETE(req: Request) {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const id = new URL(req.url).searchParams.get("id");
  const p = await getProfile(u.id);
  p.bookLog = (p.bookLog || []).filter((e) => e.id !== id);
  await saveProfile(p);
  return json({ bookLog: p.bookLog });
}
