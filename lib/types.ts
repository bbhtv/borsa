export type Role = "teacher" | "student";

/** The four cognitive domains the engine reports on, plus reading. */
export type Domain = "reaction" | "attention" | "memory" | "math";
export const DOMAINS: Domain[] = ["reaction", "attention", "memory", "math"];

export const DOMAIN_LABEL: Record<Domain, string> = {
  reaction: "Tepki Süresi",
  attention: "Dikkat ve Odaklanma",
  memory: "Hafıza",
  math: "Zihinsel Matematik",
};

export const DOMAIN_SHORT: Record<Domain, string> = {
  reaction: "Tepki",
  attention: "Dikkat",
  memory: "Hafıza",
  math: "Matematik",
};

export const DOMAIN_EMOJI: Record<Domain, string> = {
  reaction: "⚡",
  attention: "🎯",
  memory: "🧠",
  math: "➗",
};

export const DOMAIN_COLOR: Record<Domain, string> = {
  reaction: "#E8890C",
  attention: "#0AA5BC",
  memory: "#6D4AE8",
  math: "#16A34A",
};

export interface User {
  id: string;
  role: Role;
  username: string;
  name: string;
  passwordHash: string;
  teacherId?: string;
  grade?: string;
  createdAt: number;
  demo?: boolean;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface ReadingTest {
  id: string;
  at: number;
  textId: string;
  words: number;
  seconds: number;
  wpm: number;
  /** 0..1 */
  comprehension: number;
  /** effective reading speed = wpm * comprehension */
  ers: number;
  kind: "placement" | "retest";
}

/** Per-game running statistics used by the improvement engine. */
export interface GameStat {
  plays: number;
  level: number;
  bestScore: number;
  lastAt: number;
  /** first two performance values per domain (baseline) */
  first: Partial<Record<Domain | "reading", number[]>>;
  /** last up to 12 performance values per domain */
  recent: Partial<Record<Domain | "reading", number[]>>;
}

export interface DomainSnapshot {
  day: string;
  values: Partial<Record<Domain, number>>;
  wpm?: number;
}

export interface StudentProfile {
  userId: string;
  placementDone: boolean;
  baselineWpm?: number;
  baselineComp?: number;
  currentWpm?: number;
  currentComp?: number;
  /** pace the exercises use – fully automatic, never set by the student */
  trainingWpm: number;
  /** best pace achieved in paced reading with good comprehension */
  bestTrainingWpm?: number;
  streak: number;
  lastActiveDay?: string;
  totalSeconds: number;
  totalExercises: number;
  readingTests: ReadingTest[];
  games: Record<string, GameStat>;
  history: DomainSnapshot[];
  sound: boolean;
  /** reading comfort settings used in every reading screen */
  readingPrefs: ReadingPrefs;
  /** real-book reading sessions logged with the timer */
  bookLog: BookEntry[];
  /** free reading of the student's own texts */
  freeReading: { seconds: number; words: number; sessions: number };
}

export interface ReadingPrefs {
  font: "jakarta" | "lexend" | "serif";
  size: "m" | "l" | "xl";
  spacing: "normal" | "wide";
  /** BeeLine-style colour gradient across lines to ease return sweeps */
  colorLines: boolean;
}

export const DEFAULT_READING_PREFS: ReadingPrefs = { font: "jakarta", size: "m", spacing: "normal", colorLines: false };

export interface BookEntry {
  id: string;
  at: number;
  title: string;
  pages: number;
  wordsPerPage: number;
  seconds: number;
  wpm: number;
}

export interface PlanItem {
  gameId: string;
  source: "auto" | "teacher" | "test";
  assignmentId?: string;
  done: boolean;
  score?: number;
  at?: number;
}

export interface DailyPlan {
  day: string;
  items: PlanItem[];
  createdAt: number;
}

export interface Assignment {
  id: string;
  teacherId: string;
  title: string;
  note?: string;
  gameIds: string[];
  /** how many days these games are added to the daily program */
  days: number;
  startDay: string;
  createdAt: number;
  active: boolean;
  completions: number;
}

export interface GameResult {
  id: string;
  at: number;
  gameId: string;
  level: number;
  nextLevel: number;
  score: number;
  seconds: number;
  summary: string;
  perf: Partial<Record<Domain | "reading", number>>;
  metrics: Record<string, number | string>;
  source?: PlanItem["source"] | "free";
}

export interface DomainReport {
  domain: Domain;
  /** percentage improvement vs. baseline, null while still measuring */
  improvement: number | null;
  sessions: number;
  games: { gameId: string; improvement: number | null; plays: number }[];
}

export interface ReadingReport {
  baselineWpm: number | null;
  currentWpm: number | null;
  wpmChange: number | null;
  baselineComp: number | null;
  currentComp: number | null;
  baselineErs: number | null;
  currentErs: number | null;
  ersChange: number | null;
  trainingWpm: number;
  tests: ReadingTest[];
  nextTestDue: boolean;
}

export interface StudentSummary {
  user: PublicUser;
  profile: StudentProfile;
  reading: ReadingReport;
  domains: DomainReport[];
  overall: number | null;
  today: { done: number; total: number };
}
