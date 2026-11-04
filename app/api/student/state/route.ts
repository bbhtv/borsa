import { getAssignments, getResults, getTodayPlan, getUser, studentSummary } from "@/lib/db";
import { json, requireUser } from "@/lib/api";
import { storageIsPersistent } from "@/lib/kv";
import { activeAssignments } from "@/lib/plan";
import { dayKey } from "@/lib/engine";

export async function GET() {
  const u = await requireUser("student");
  if (u instanceof Response) return u;
  const plan = await getTodayPlan(u.id);
  const summary = await studentSummary(u);
  const teacher = u.teacherId ? await getUser(u.teacherId) : null;
  const assignments = activeAssignments(await getAssignments(u.id), dayKey());
  const results = await getResults(u.id, 30);
  return json({
    ...summary,
    plan,
    today: { done: plan ? plan.items.filter((i) => i.done).length : 0, total: plan ? plan.items.length : 0 },
    teacherName: teacher?.name ?? null,
    assignments,
    results,
    persistent: storageIsPersistent(),
  });
}
