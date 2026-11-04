import { getUser, listStudentIds, studentSummary } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { DOMAINS } from "@/lib/types";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const num = (v: number | null | undefined, d = 1) => (v == null ? "" : String(Math.round(v * 10 ** d) / 10 ** d).replace(".", ","));

/** Class report as CSV (semicolon separated + BOM so Excel opens Turkish characters correctly). */
export async function GET() {
  const t = await requireUser("teacher");
  if (t instanceof Response) return t;
  const head = [
    "Ad Soyad", "Kullanıcı adı", "Sınıf", "Başlangıç (k/dk)", "Güncel (k/dk)", "Hız değişimi %", "Anlama %", "Etkili hız (k/dk)",
    "Tepki %", "Dikkat %", "Hafıza %", "Matematik %", "Genel gelişim %", "Seri (gün)", "Toplam egzersiz", "Toplam süre (dk)", "Kitap sayfası", "Son aktif gün",
  ];
  const rows: string[][] = [];
  for (const id of await listStudentIds(t.id)) {
    const u = await getUser(id);
    if (!u) continue;
    const s = await studentSummary(u, false);
    const dom = (d: (typeof DOMAINS)[number]) => num(s.domains.find((x) => x.domain === d)?.improvement ?? null);
    rows.push([
      u.name, u.username, u.grade || "", String(s.reading.baselineWpm ?? ""), String(s.reading.currentWpm ?? ""), num(s.reading.wpmChange),
      s.reading.currentComp != null ? String(Math.round(s.reading.currentComp * 100)) : "", String(s.reading.currentErs ?? ""),
      dom("reaction"), dom("attention"), dom("memory"), dom("math"), num(s.overall), String(s.profile.streak), String(s.profile.totalExercises),
      String(Math.round(s.profile.totalSeconds / 60)), String((s.profile.bookLog || []).reduce((a, b) => a + b.pages, 0)), s.profile.lastActiveDay || "",
    ]);
  }
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tavsan-sinif-raporu.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
