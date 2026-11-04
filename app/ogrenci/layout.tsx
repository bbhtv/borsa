import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentProvider } from "@/components/student/StudentContext";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/giris");
  if (s.role !== "student") redirect("/egitmen");
  return <StudentProvider>{children}</StudentProvider>;
}
