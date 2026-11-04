import { GAMES, GAME_MAP, primaryDomain } from "./catalog";
import { dayDiff, domainReports, readingReport } from "./engine";
import type { Assignment, DailyPlan, Domain, PlanItem, StudentProfile } from "./types";

export const DAILY_SIZE = 12;

export const ONBOARDING: string[] = ["okuma-testi", "tepki-avcisi", "ok-yagmuru", "sayi-hafizasi", "zihinden-hesap"];

/** Mulberry32 – small deterministic PRNG */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function activeAssignments(list: Assignment[], day: string) {
  return list.filter((a) => a.active && dayDiff(a.startDay, day) >= 0 && dayDiff(a.startDay, day) < a.days);
}

/**
 * Builds a balanced 12-step daily program:
 *  test (weekly) → eye warm-up → perception → paced reading → cognitive games
 *  (weakest domain first) → teacher assignments → closing reading drill.
 */
export function generatePlan(p: StudentProfile, assignments: Assignment[], day: string): DailyPlan {
  const rand = rng(hashStr(p.userId + day));
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const lastAt = (id: string) => p.games[id]?.lastAt || 0;
  // prefer games that were not played recently, with a little randomness
  const byFreshness = (ids: string[]) =>
    [...ids].sort((a, b) => lastAt(a) + rand() * 86400000 * 1.5 - (lastAt(b) + rand() * 86400000 * 1.5));

  const items: PlanItem[] = [];
  const used = new Set<string>();
  const push = (gameId: string, source: PlanItem["source"], assignmentId?: string) => {
    items.push({ gameId, source, assignmentId, done: false });
    used.add(gameId);
  };

  const rr = readingReport(p);
  if (rr.nextTestDue) push("okuma-testi", "test");

  // 1. eye warm-up (2)
  for (const id of byFreshness(["sicrayan-tavsan", "kelebek-sayaci", "goz-takibi"]).slice(0, 2)) push(id, "auto");
  // 2. perception (1)
  push(byFreshness(["genisleyen-cerceve", "simsek-kelime", "schulte", "ayni-mi"])[0], "auto");
  // 3. paced reading
  push("rehberli-okuma", "auto");

  // teacher assignments (inserted later, but count them now)
  const teacherItems: PlanItem[] = [];
  for (const a of activeAssignments(assignments, day)) {
    for (const g of a.gameIds) {
      if (!GAME_MAP[g]) continue;
      teacherItems.push({ gameId: g, source: g === "okuma-testi" ? "test" : "teacher", assignmentId: a.id, done: false });
    }
  }

  // 4. cognitive games – weakest domains get more slots
  const closing = pick(["blok-okuma", "golge-okuma"]);
  const slots = Math.max(2, DAILY_SIZE - items.length - teacherItems.length - 1);
  const reps = domainReports(p);
  const order: Domain[] = [...reps]
    .sort((a, b) => {
      const ai = a.improvement ?? -999;
      const bi = b.improvement ?? -999;
      if (ai !== bi) return ai - bi;
      return a.sessions - b.sessions;
    })
    .map((r) => r.domain);
  const pools: Record<Domain, string[]> = { reaction: [], attention: [], memory: [], math: [] };
  for (const g of GAMES) {
    if (g.hidden || g.category === "goz" || g.category === "okuma") continue;
    const d = primaryDomain(g);
    if (d !== "reading") pools[d].push(g.id);
  }
  // reaction pool is small – borrow from attention games with strong reaction weight
  pools.reaction.push("dur-gec", "hangisi-buyuk");
  const teacherIds = new Set(teacherItems.map((t) => t.gameId));
  const queue: string[] = [];
  let k = 0;
  while (queue.length < slots && k < 40) {
    const dom = order[k % order.length];
    // weakest domain appears twice in the first rotation
    const cands = byFreshness(pools[dom]).filter((id) => !used.has(id) && !queue.includes(id) && !teacherIds.has(id));
    if (cands.length) queue.push(cands[0]);
    if (k === 0 && queue.length < slots) {
      const c2 = byFreshness(pools[dom]).filter((id) => !used.has(id) && !queue.includes(id) && !teacherIds.has(id));
      if (c2.length) queue.push(c2[0]);
    }
    k++;
  }
  for (const id of queue) push(id, "auto");
  for (const t of teacherItems) {
    if (t.gameId === "okuma-testi" && used.has("okuma-testi")) continue;
    if (t.gameId === "okuma-testi") items.unshift(t);
    else items.push(t);
    used.add(t.gameId);
  }
  if (!used.has(closing)) push(closing, "auto");
  return { day, items, createdAt: Date.now() };
}
