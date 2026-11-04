import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureSeed, getUser } from "@/lib/db";
import { TeacherShell } from "@/components/teacher/TeacherShell";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await ensureSeed();
  const s = await getSession();
  if (!s) redirect("/giris");
  if (s.role !== "teacher") redirect("/ogrenci");
  const u = await getUser(s.uid);
  if (!u) redirect("/giris");
  return <TeacherShell name={u.name}>{children}</TeacherShell>;
}
