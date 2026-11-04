import { GAME_MAP } from "@/lib/catalog";
import { getTodayPlan, recordResult } from "@/lib/db";
import { fail, json, readJson, requireUser } from "@/lib/api";
import type { GameResult } from "@/lib/types";
import type { ReadingPayload } from "@/lib/engine";

interface Body {
  gameId: string;
  level: number;
  nextLevel: number;
  score: number;
  seconds: number;
  summary: string;
  perf: GameResult["perf"];
  metrics: GameResult["metrics"];
  planIndex?: number;
  source?: GameResult["source"];
  reading?: ReadingPayload;
}

const num = (v: unknown, d = 0) => (typeof v === "number" && isFinite(v) ? v : d);

export async function POST(req: Request) {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const b = await readJson<Body>(req);
  if (!b || !GAME_MAP[b.gameId]) return fail("Geçersiz egzersiz.");
  const perf: GameResult["perf"] = {};
  for (const [k, v] of Object.entries(b.perf || {})) if (num(v) > 0) perf[k as keyof typeof perf] = num(v);
  const metrics: GameResult["metrics"] = {};
  for (const [k, v] of Object.entries(b.metrics || {}).slice(0, 30))
    if (typeof v === "number" || typeof v === "string") metrics[k] = typeof v === "string" ? v.slice(0, 120) : v;
  const reading = b.reading && num(b.reading.wpm) > 0
    ? {
        textId: String(b.reading.textId || "").slice(0, 40),
        words: num(b.reading.words),
        seconds: num(b.reading.seconds),
        wpm: num(b.reading.wpm),
        comprehension: Math.max(0, Math.min(1, num(b.reading.comprehension))),
        kind: b.reading.kind,
      }
    : undefined;
  const { result, outcome, profile } = await recordResult(
    u.id,
    {
      gameId: b.gameId,
      level: num(b.level, 1),
      nextLevel: num(b.nextLevel, num(b.level, 1)),
      score: Math.max(0, Math.min(100, Math.round(num(b.score)))),
      seconds: Math.max(0, Math.min(3600, num(b.seconds))),
      summary: String(b.summary || "").slice(0, 200),
      perf,
      metrics,
      source: b.source,
    },
    { planIndex: b.planIndex, reading }
  );
  // first placement test creates today's plan
  const plan = await getTodayPlan(u.id, profile);
  return json({ result, outcome, profile: { level: profile.level, xp: profile.xp, trainingWpm: profile.trainingWpm, streak: profile.streak, placementDone: profile.placementDone }, plan });
}
