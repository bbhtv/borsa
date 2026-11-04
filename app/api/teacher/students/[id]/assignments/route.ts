import { randomUUID } from "crypto";
import { getAssignments, getUser, peekTodayPlan, saveAssignments, savePlan } from "@/lib/db";
import { fail, json, readJson, requireUser } from "@/lib/api";
import { GAME_MAP } from "@/lib/catalog";
import { dayKey } from "@/lib/engine";
import type { Assignment } from "@/lib/types";

async function guard(id: string) {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const u = await getUser(id);
  if (!u || u.role !== "student" || u.teacherId !== t.id) return fail("Öğrenci bulunamadı.", 404);
  return { t, u };
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(id);
  if (g instanceof Response) return g;
  const b = await readJson<{ title?: string; note?: string; gameIds?: string[]; days?: number }>(req);
  const gameIds = (b?.gameIds || []).filter((x) => GAME_MAP[x]).slice(0, 12);
  if (!gameIds.length) return fail("En az bir egzersiz seç.");
  const a: Assignment = {
    id: randomUUID(),
    teacherId: g.t.id,
    title: (b?.title || "Eğitmen ödevi").trim().slice(0, 80),
    note: b?.note?.trim().slice(0, 400) || undefined,
    gameIds,
    days: Math.max(1, Math.min(30, Math.round(b?.days || 1))),
    startDay: dayKey(),
    createdAt: Date.now(),
    active: true,
    completions: 0,
  };
  const list = await getAssignments(id);
  list.push(a);
  await saveAssignments(id, list);

  // if today's program already exists, append the new activities right away
  const plan = await peekTodayPlan(id);
  if (plan) {
    for (const gid of gameIds) {
      const item = { gameId: gid, source: gid === "okuma-testi" ? ("test" as const) : ("teacher" as const), assignmentId: a.id, done: false };
      plan.items.push(item);
    }
    await savePlan(id, plan);
  }
  return json({ assignment: a });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = await guard(id);
  if (g instanceof Response) return g;
  const aid = new URL(req.url).searchParams.get("aid");
  const list = await getAssignments(id);
  const a = list.find((x) => x.id === aid);
  if (!a) return fail("Ödev bulunamadı.", 404);
  a.active = false;
  await saveAssignments(id, list);
  const plan = await peekTodayPlan(id);
  if (plan) {
    plan.items = plan.items.filter((it) => it.assignmentId !== aid || it.done);
    await savePlan(id, plan);
  }
  return json({ ok: true });
}
