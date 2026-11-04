import "server-only";
import { randomUUID } from "crypto";
import { kv } from "./kv";
import { hashPassword } from "./auth";
import { applyResult, dayKey, domainReports, newProfile, overallImprovement, readingReport } from "./engine";
import { generatePlan } from "./plan";
import { GAMES } from "./catalog";
import type {
  Assignment,
  DailyPlan,
  GameResult,
  PublicUser,
  StudentProfile,
  StudentSummary,
  User,
} from "./types";

export const DEMO = {
  teacher: { username: "egitmen", password: "tavsan2026", name: "Ayşe Öğretmen" },
  student: { username: "ogrenci", password: "tavsan2026", name: "Deniz Yılmaz" },
  sample: { username: "ornek", password: "tavsan2026", name: "Örnek Öğrenci (demo veri)" },
};

const K = {
  user: (id: string) => `user:${id}`,
  uname: (u: string) => `username:${u.toLowerCase()}`,
  students: (tid: string) => `teacher:${tid}:students`,
  profile: (sid: string) => `profile:${sid}`,
  plan: (sid: string, day: string) => `plan:${sid}:${day}`,
  assignments: (sid: string) => `assign:${sid}`,
  results: (sid: string) => `results:${sid}`,
  seeded: "meta:seeded:v1",
};

export function publicUser(u: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}

export function normalizeUsername(u: string) {
  return u
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

/* ---------------- users ---------------- */
export async function getUser(id: string) {
  return kv().get<User>(K.user(id));
}
export async function getUserByUsername(username: string) {
  const id = await kv().get<string>(K.uname(normalizeUsername(username)));
  return id ? getUser(id) : null;
}
export async function saveUser(u: User) {
  await kv().set(K.user(u.id), u);
}

export async function createUser(input: {
  role: User["role"];
  username: string;
  password: string;
  name: string;
  teacherId?: string;
  grade?: string;
  demo?: boolean;
}): Promise<User> {
  const username = normalizeUsername(input.username);
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new Error("Kullanıcı adı 3-32 karakter olmalı (harf, rakam, . _ -).");
  if (input.password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
  if (await kv().get(K.uname(username))) throw new Error("Bu kullanıcı adı zaten alınmış.");
  const u: User = {
    id: randomUUID(),
    role: input.role,
    username,
    name: input.name.trim() || username,
    passwordHash: hashPassword(input.password),
    teacherId: input.teacherId,
    grade: input.grade,
    createdAt: Date.now(),
    demo: input.demo,
  };
  await saveUser(u);
  await kv().set(K.uname(username), u.id);
  if (u.role === "student") {
    await saveProfile(newProfile(u.id));
    if (u.teacherId) {
      const list = (await kv().get<string[]>(K.students(u.teacherId))) || [];
      list.push(u.id);
      await kv().set(K.students(u.teacherId), list);
    }
  }
  return u;
}

export async function deleteStudent(teacherId: string, sid: string) {
  const u = await getUser(sid);
  if (!u || u.teacherId !== teacherId) throw new Error("Öğrenci bulunamadı.");
  const list = (await kv().get<string[]>(K.students(teacherId))) || [];
  await kv().set(
    K.students(teacherId),
    list.filter((x) => x !== sid)
  );
  await kv().del(K.uname(u.username));
  await kv().del(K.user(sid));
  await kv().del(K.profile(sid));
  await kv().del(K.assignments(sid));
  await kv().del(K.results(sid));
}

export async function setPassword(uid: string, password: string) {
  if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
  const u = await getUser(uid);
  if (!u) throw new Error("Kullanıcı bulunamadı.");
  u.passwordHash = hashPassword(password);
  await saveUser(u);
}

export async function listStudentIds(teacherId: string) {
  return (await kv().get<string[]>(K.students(teacherId))) || [];
}

/* ---------------- profile ---------------- */
export async function getProfile(sid: string): Promise<StudentProfile> {
  const p = await kv().get<StudentProfile>(K.profile(sid));
  if (p) return { ...newProfile(sid), ...p };
  const fresh = newProfile(sid);
  await saveProfile(fresh);
  return fresh;
}
export async function saveProfile(p: StudentProfile) {
  await kv().set(K.profile(p.userId), p);
}

/* ---------------- assignments ---------------- */
export async function getAssignments(sid: string) {
  return (await kv().get<Assignment[]>(K.assignments(sid))) || [];
}
export async function saveAssignments(sid: string, list: Assignment[]) {
  await kv().set(K.assignments(sid), list);
}

/* ---------------- plan ---------------- */
export async function getTodayPlan(sid: string, profile?: StudentProfile): Promise<DailyPlan | null> {
  const p = profile || (await getProfile(sid));
  if (!p.placementDone) return null;
  const day = dayKey();
  const existing = await kv().get<DailyPlan>(K.plan(sid, day));
  if (existing) return existing;
  const plan = generatePlan(p, await getAssignments(sid), day);
  await kv().set(K.plan(sid, day), plan);
  return plan;
}
export async function peekTodayPlan(sid: string) {
  return kv().get<DailyPlan>(K.plan(sid, dayKey()));
}
export async function savePlan(sid: string, plan: DailyPlan) {
  await kv().set(K.plan(sid, plan.day), plan);
}

/* ---------------- results ---------------- */
export async function getResults(sid: string, n = 60) {
  return kv().lrange<GameResult>(K.results(sid), 0, n - 1);
}

export async function recordResult(
  sid: string,
  r: Omit<GameResult, "id" | "at">,
  opts: { planIndex?: number; reading?: Parameters<typeof applyResult>[2] }
) {
  const profile = await getProfile(sid);
  const result: GameResult = { ...r, id: randomUUID(), at: Date.now() };
  const outcome = applyResult(profile, result, opts.reading);
  await saveProfile(profile);
  await kv().lpush(K.results(sid), result, 400);

  // mark plan item
  const plan = await peekTodayPlan(sid);
  if (plan) {
    let idx = typeof opts.planIndex === "number" ? opts.planIndex : -1;
    if (!(idx >= 0 && plan.items[idx] && plan.items[idx].gameId === r.gameId && !plan.items[idx].done)) {
      idx = plan.items.findIndex((it) => it.gameId === r.gameId && !it.done);
    }
    if (idx >= 0) {
      plan.items[idx] = { ...plan.items[idx], done: true, score: r.score, at: result.at };
      await savePlan(sid, plan);
      const aid = plan.items[idx].assignmentId;
      if (aid) {
        const list = await getAssignments(sid);
        const a = list.find((x) => x.id === aid);
        if (a) {
          a.completions += 1;
          await saveAssignments(sid, list);
        }
      }
    }
  }
  return { result, outcome, profile };
}

/* ---------------- summaries ---------------- */
export async function studentSummary(u: User, withPlan = true): Promise<StudentSummary> {
  const profile = await getProfile(u.id);
  const plan = withPlan ? await peekTodayPlan(u.id) : null;
  const reading = readingReport(profile);
  const domains = domainReports(profile);
  return {
    user: publicUser(u),
    profile,
    reading,
    domains,
    overall: overallImprovement(domains, reading),
    today: { done: plan ? plan.items.filter((i) => i.done).length : 0, total: plan ? plan.items.length : 0 },
  };
}

/* ---------------- seed ---------------- */
let seedPromise: Promise<void> | null = null;
export function ensureSeed() {
  if (!seedPromise) seedPromise = seed().catch((e) => {
    seedPromise = null;
    throw e;
  });
  return seedPromise;
}

async function seed() {
  if (await kv().get(K.seeded)) return;
  let teacher = await getUserByUsername(DEMO.teacher.username);
  if (!teacher) teacher = await createUser({ role: "teacher", ...DEMO.teacher });
  if (!(await getUserByUsername(DEMO.student.username)))
    await createUser({ role: "student", ...DEMO.student, teacherId: teacher.id, grade: "7. sınıf" });
  if (!(await getUserByUsername(DEMO.sample.username))) {
    const s = await createUser({ role: "student", ...DEMO.sample, teacherId: teacher.id, grade: "8. sınıf", demo: true });
    await seedSampleHistory(s.id);
  }
  await kv().set(K.seeded, { at: Date.now() });
}

/** Generates a clearly-labelled sample history so the teacher dashboard has something to show. */
async function seedSampleHistory(sid: string) {
  const profile = newProfile(sid);
  const DAY = 86400000;
  const start = Date.now() - 28 * DAY; // last sample day ends a few hours before "now"
  let seedN = 7;
  const rnd = () => {
    seedN = (seedN * 9301 + 49297) % 233280;
    return seedN / 233280;
  };
  const playable = GAMES.filter((g) => !g.hidden);
  for (let d = 0; d < 28; d++) {
    if (d % 7 === 5) continue; // rest day
    const at0 = start + d * DAY + 17 * 3600000;
    const t = d / 27; // training progress 0..1
    if (d === 0 || d % 7 === 0) {
      const wpm = Math.round(165 + 95 * t + rnd() * 10);
      const comp = Math.min(1, 0.6 + 0.2 * t + (rnd() > 0.5 ? 0.2 : 0));
      const r: GameResult = {
        id: randomUUID(), at: at0, gameId: "okuma-testi", level: 1, nextLevel: 1, score: Math.round(comp * 100),
        seconds: 120, summary: `${wpm} kelime/dk`, perf: { reading: wpm * comp }, metrics: { wpm, comprehension: comp },
      };
      applyResult(profile, r, { textId: "sample", words: 300, seconds: (300 / wpm) * 60, wpm, comprehension: comp });
    }
    for (let i = 0; i < 7; i++) {
      const g = playable[Math.floor(rnd() * playable.length)];
      const gain = 1 + (0.25 + rnd() * 0.15) * t;
      const perf: GameResult["perf"] = {};
      for (const dom of Object.keys(g.domains)) perf[dom as keyof typeof perf] = 10 * gain * (0.93 + rnd() * 0.14);
      const r: GameResult = {
        id: randomUUID(), at: at0 + i * 120000, gameId: g.id, level: 1 + Math.floor(t * 6), nextLevel: 1 + Math.floor(t * 7),
        score: Math.round(55 + 35 * t + rnd() * 10), seconds: g.seconds, summary: "Demo oturum", perf, metrics: {},
      };
      const reading = g.domains.reading
        ? { textId: "sample", words: 180, seconds: 60, wpm: profile.trainingWpm, comprehension: rnd() > 0.3 ? 1 : 0.67, kind: "practice" as const }
        : undefined;
      applyResult(profile, r, reading);
      if (d > 20) await kv().lpush(K.results(sid), r, 400);
    }
  }
  await saveProfile(profile);
}
