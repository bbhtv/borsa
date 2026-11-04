import { createUser, getUser, listStudentIds, publicUser, studentSummary } from "@/lib/db";
import { fail, json, readJson, requireUser } from "@/lib/api";
import { storageIsPersistent } from "@/lib/kv";
import type { StudentSummary } from "@/lib/types";

export async function GET() {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const ids = await listStudentIds(t.id);
  const out: StudentSummary[] = [];
  for (const id of ids) {
    const u = await getUser(id);
    if (u) out.push(await studentSummary(u));
  }
  // keep payload small for the list view
  const students = out.map((s) => ({
    ...s,
    profile: { ...s.profile, games: {}, history: s.profile.history.slice(-30), readingTests: s.profile.readingTests.slice(-10) },
  }));
  return json({ teacher: publicUser(t), students, persistent: storageIsPersistent() });
}

export async function POST(req: Request) {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const b = await readJson<{ name?: string; username?: string; password?: string; grade?: string }>(req);
  if (!b?.name || !b?.username || !b?.password) return fail("Ad, kullanıcı adı ve şifre gerekli.");
  try {
    const u = await createUser({
      role: "student",
      name: b.name,
      username: b.username,
      password: b.password,
      grade: b.grade,
      teacherId: t.id,
    });
    return json({ user: publicUser(u) });
  } catch (e) {
    return fail((e as Error).message);
  }
}
