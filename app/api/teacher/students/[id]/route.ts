import {
  deleteStudent,
  getAssignments,
  getResults,
  getUser,
  peekTodayPlan,
  saveUser,
  setPassword,
  studentSummary,
} from "@/lib/db";
import { fail, json, readJson, requireUser } from "@/lib/api";
import type { User } from "@/lib/types";

async function load(teacherId: string, id: string): Promise<User | null> {
  const u = await getUser(id);
  if (!u || u.role !== "student" || u.teacherId !== teacherId) return null;
  return u;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const { id } = await ctx.params;
  const u = await load(t.id, id);
  if (!u) return fail("Öğrenci bulunamadı.", 404);
  const [summary, assignments, results, plan] = await Promise.all([
    studentSummary(u),
    getAssignments(u.id),
    getResults(u.id, 80),
    peekTodayPlan(u.id),
  ]);
  return json({ ...summary, assignments: assignments.sort((a, b) => b.createdAt - a.createdAt), results, plan });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const { id } = await ctx.params;
  const u = await load(t.id, id);
  if (!u) return fail("Öğrenci bulunamadı.", 404);
  const b = await readJson<{ name?: string; grade?: string; password?: string }>(req);
  try {
    if (b?.password) await setPassword(u.id, b.password);
    const fresh = (await getUser(u.id))!;
    if (b?.name) fresh.name = b.name.trim().slice(0, 80);
    if (typeof b?.grade === "string") fresh.grade = b.grade.trim().slice(0, 40);
    await saveUser(fresh);
  } catch (e) {
    return fail((e as Error).message);
  }
  return json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const { id } = await ctx.params;
  try {
    await deleteStudent(t.id, id);
  } catch (e) {
    return fail((e as Error).message, 404);
  }
  return json({ ok: true });
}
