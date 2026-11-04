/**
 * Tavşan Gelişim Motoru
 * ---------------------
 * Every exercise reports a positive "performance index" per domain (higher = better).
 * Indices are only ever compared WITHIN the same exercise, so their scales don't need
 * to match between games:
 *
 *   improvement(game, domain) = current / baseline − 1
 *     baseline = mean of the first two sessions (first session while < 4 sessions)
 *     current  = mean of the most recent three sessions
 *
 *   domain improvement = Σ w·n·imp / Σ w·n
 *     w = weight of the game for that domain, n = min(sessions−1, 5) (reliability)
 *
 * Reaction-time indices use the Inverse Efficiency Score (IES = mean RT / accuracy),
 * so speed gained by guessing is penalised. Reading uses Effective Reading Speed
 * (ERS = words-per-minute × comprehension).
 */
import { GAME_MAP } from "./catalog";
import {
  DEFAULT_READING_PREFS,
  DOMAINS,
  type Domain,
  type DomainReport,
  type GameResult,
  type GameStat,
  type ReadingReport,
  type ReadingTest,
  type StudentProfile,
} from "./types";

export const MIN_WPM = 60;
export const MAX_WPM = 1000;

export function round5(n: number) {
  return Math.round(n / 5) * 5;
}
export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

/* ---------- dates (Türkiye saati) ---------- */
export function dayKey(d: Date | number = Date.now()): string {
  const date = typeof d === "number" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
}

/* ---------- profile ---------- */
export function newProfile(userId: string): StudentProfile {
  return {
    userId,
    placementDone: false,
    trainingWpm: 180,
    streak: 0,
    totalSeconds: 0,
    totalExercises: 0,
    readingTests: [],
    games: {},
    history: [],
    sound: true,
    readingPrefs: { ...DEFAULT_READING_PREFS },
    bookLog: [],
    freeReading: { seconds: 0, words: 0, sessions: 0 },
  };
}

/* ---------- per game improvement ---------- */
export function gameImprovement(stat: GameStat | undefined, d: Domain | "reading"): number | null {
  if (!stat) return null;
  const first = stat.first[d] || [];
  const recent = stat.recent[d] || [];
  const n = Math.max(recent.length, first.length);
  const total = stat.plays;
  if (total < 2 || !first.length || !recent.length || n < 1) return null;
  let base: number;
  let cur: number;
  if (total < 4) {
    base = first[0];
    cur = mean(recent.slice(-Math.min(2, total - 1)));
  } else {
    base = mean(first.slice(0, 2));
    cur = mean(recent.slice(-3));
  }
  if (!(base > 0) || !(cur > 0)) return null;
  return clamp(cur / base - 1, -0.6, 3);
}

export function domainReports(p: StudentProfile): DomainReport[] {
  return DOMAINS.map((domain) => {
    let num = 0;
    let den = 0;
    let sessions = 0;
    const games: DomainReport["games"] = [];
    for (const [gameId, stat] of Object.entries(p.games)) {
      const meta = GAME_MAP[gameId];
      const w = meta?.domains[domain];
      if (!meta || !w) continue;
      sessions += stat.plays;
      const imp = gameImprovement(stat, domain);
      games.push({ gameId, improvement: imp == null ? null : imp * 100, plays: stat.plays });
      if (imp == null) continue;
      const n = Math.min(stat.plays - 1, 5);
      num += w * n * imp;
      den += w * n;
    }
    games.sort((a, b) => b.plays - a.plays);
    return { domain, improvement: den > 0 ? Math.round((num / den) * 1000) / 10 : null, sessions, games };
  });
}

export function readingReport(p: StudentProfile, now = Date.now()): ReadingReport {
  const tests = p.readingTests;
  const first = tests[0];
  const last = tests[tests.length - 1];
  const pct = (a?: number, b?: number) => (a && b ? Math.round((b / a - 1) * 1000) / 10 : null);
  return {
    baselineWpm: first?.wpm ?? null,
    currentWpm: last?.wpm ?? null,
    wpmChange: tests.length > 1 ? pct(first.wpm, last.wpm) : null,
    baselineComp: first?.comprehension ?? null,
    currentComp: last?.comprehension ?? null,
    baselineErs: first?.ers ?? null,
    currentErs: last?.ers ?? null,
    ersChange: tests.length > 1 ? pct(first.ers, last.ers) : null,
    trainingWpm: p.trainingWpm,
    tests,
    // weekly re-test; an unreliable test (comprehension < 40 %) is repeated the next day
    nextTestDue: !!last && (now - last.at > 7 * 86400000 || (last.comprehension < 0.4 && now - last.at > 20 * 3600000)),
  };
}

export function overallImprovement(domains: DomainReport[], reading: ReadingReport): number | null {
  const vals = domains.map((d) => d.improvement).filter((v): v is number => v != null);
  if (reading.ersChange != null) vals.push(reading.ersChange);
  if (!vals.length) return null;
  return Math.round(mean(vals) * 10) / 10;
}

/**
 * Converts a measured speed into a trainable pace. Reading fast without understanding
 * is skimming, so the pace is scaled by comprehension (80 % → 1.0, 100 % → 1.1, ≤36 % → 0.45).
 */
export function comprehensionFactor(comp: number) {
  return clamp(comp / 0.8, 0.45, 1.1);
}

/* ---------- applying a finished exercise ---------- */
export interface ReadingPayload {
  textId: string;
  words: number;
  seconds: number;
  wpm: number;
  comprehension: number;
  kind?: "placement" | "retest" | "practice";
}

export interface ApplyOutcome {
  newTrainingWpm?: number;
  paceChange?: number;
  test?: ReadingTest;
}

export function applyResult(p: StudentProfile, r: GameResult, reading?: ReadingPayload): ApplyOutcome {
  const now = r.at;
  const today = dayKey(now);
  const out: ApplyOutcome = {};

  /* streak */
  if (p.lastActiveDay !== today) {
    if (p.lastActiveDay && dayDiff(p.lastActiveDay, today) === 1) p.streak += 1;
    else p.streak = 1;
    p.lastActiveDay = today;
  }

  /* game stats */
  const stat: GameStat = p.games[r.gameId] || { plays: 0, level: 1, bestScore: 0, lastAt: 0, first: {}, recent: {} };
  stat.plays += 1;
  stat.level = clamp(Math.round(r.nextLevel || stat.level), 1, 20);
  stat.bestScore = Math.max(stat.bestScore, r.score);
  stat.lastAt = now;
  for (const [d, v] of Object.entries(r.perf)) {
    if (!(typeof v === "number" && isFinite(v) && v > 0)) continue;
    const key = d as Domain | "reading";
    const f = (stat.first[key] ||= []);
    if (f.length < 2) f.push(v);
    const rec = (stat.recent[key] ||= []);
    rec.push(v);
    if (rec.length > 12) rec.splice(0, rec.length - 12);
  }
  p.games[r.gameId] = stat;

  p.totalExercises += 1;
  p.totalSeconds += Math.max(0, Math.round(r.seconds));

  /* reading */
  if (reading && reading.wpm > 0) {
    const wpm = clamp(Math.round(reading.wpm), 20, 3000);
    const comp = clamp(reading.comprehension, 0, 1);
    if (reading.kind === "placement" || reading.kind === "retest" || r.gameId === "okuma-testi") {
      const kind: ReadingTest["kind"] = p.placementDone ? "retest" : "placement";
      const test: ReadingTest = {
        id: r.id,
        at: now,
        textId: reading.textId,
        words: reading.words,
        seconds: Math.round(reading.seconds),
        wpm,
        comprehension: comp,
        ers: Math.round(wpm * comp),
        kind,
      };
      p.readingTests.push(test);
      out.test = test;
      if (kind === "placement") {
        p.placementDone = true;
        p.baselineWpm = wpm;
        p.baselineComp = comp;
        // start slightly above the comfortable pace – scaled down when comprehension was weak
        p.trainingWpm = clamp(round5(wpm * comprehensionFactor(comp)), MIN_WPM, MAX_WPM);
      } else if (comp >= 0.6) {
        p.trainingWpm = clamp(Math.max(p.trainingWpm, round5(wpm * Math.min(1.05, comprehensionFactor(comp)))), MIN_WPM, MAX_WPM);
      }
      p.currentWpm = wpm;
      p.currentComp = comp;
    } else {
      /* practice: adapt the pace automatically – the student never sets it */
      const before = p.trainingWpm;
      // small steps: pacing should stay only a little above the comfortable speed
      let factor = 1;
      if (comp >= 0.8) factor = 1.04;
      else if (comp >= 0.6) factor = 1.015;
      else factor = 0.94;
      // never more than 1.6× the last measured (comprehended) speed – re-tests raise the ceiling
      const ceiling = Math.max((p.currentWpm || before) * 1.6, 200);
      const floor = Math.max(MIN_WPM, (p.baselineWpm || before) * 0.8);
      p.trainingWpm = clamp(round5(before * factor), floor, Math.min(MAX_WPM, ceiling));
      if (comp >= 0.67) p.bestTrainingWpm = Math.max(p.bestTrainingWpm || 0, wpm);
      out.newTrainingWpm = p.trainingWpm;
      out.paceChange = p.trainingWpm - before;
    }
  }

  /* history snapshot for charts */
  const reps = domainReports(p);
  const values: Partial<Record<Domain, number>> = {};
  for (const d of reps) if (d.improvement != null) values[d.domain] = d.improvement;
  const snap = { day: today, values, wpm: p.currentWpm };
  const last = p.history[p.history.length - 1];
  if (last && last.day === today) p.history[p.history.length - 1] = snap;
  else p.history.push(snap);
  if (p.history.length > 180) p.history.splice(0, p.history.length - 180);

  return out;
}

/* ---------- helpers shared with games ---------- */
/** difficulty multiplier so performance indices grow when the student reaches harder levels */
export function levelFactor(level: number) {
  return 1 + 0.12 * (Math.max(1, level) - 1);
}

/** Inverse Efficiency Score based speed index (higher is better). */
export function speedIndex(meanRtMs: number, accuracy: number) {
  if (!(meanRtMs > 0) || !(accuracy > 0)) return 0;
  const ies = meanRtMs / accuracy;
  return Math.round((100000 / ies) * 100) / 100;
}

export function nextLevelFrom(level: number, quality: number) {
  if (quality >= 0.85) return Math.min(20, level + 1);
  if (quality < 0.55) return Math.max(1, level - 1);
  return level;
}
