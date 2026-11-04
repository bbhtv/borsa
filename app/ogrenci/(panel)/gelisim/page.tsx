"use client";

import { useStudent } from "@/components/student/StudentContext";
import { DomainGrid, ReadingCard, fmtPct } from "@/components/ui/charts";
import { GameTable, ResultList } from "@/components/ui/GameTable";
import { BookSummary } from "@/components/ui/WeekGoal";

export default function Progress() {
  const { data } = useStudent();
  if (!data) return null;
  const p = data.profile;
  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex justify-end">
        <button type="button" onClick={() => window.print()} className="rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-extrabold shadow-card hover:border-brand">
          🖨️ Raporu yazdır / PDF
        </button>
      </div>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Genel gelişim", fmtPct(data.overall)],
          ["Toplam egzersiz", String(p.totalExercises)],
          ["Toplam süre", `${Math.round(p.totalSeconds / 60)} dk`],
          ["Seri", `${p.streak} gün 🔥`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-[22px] border border-line bg-surface p-4 shadow-card">
            <div className="text-xs font-bold text-muted">{l}</div>
            <div className="text-2xl font-extrabold tabular-nums">{v}</div>
          </div>
        ))}
      </section>
      <ReadingCard reading={data.reading} />
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold">Bilişsel alanlar · başlangıca göre değişim</h3>
        <DomainGrid domains={data.domains} history={p.history} />
        <p className="text-xs font-semibold text-muted">
          Nasıl hesaplanır? Her egzersizde doğruluk, tepki süresi ve ulaşılan zorluk birleşik bir performans puanına çevrilir (tepki için ters verim skoru: süre ÷ doğruluk).
          Son 3 oturumun ortalaması ilk 2 oturumun ortalamasıyla karşılaştırılır; alan puanı, o alanı çalıştıran egzersizlerin oturum sayısına göre ağırlıklı ortalamasıdır.
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold">📚 Kitap okuma</h3>
        <BookSummary profile={p} />
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold">Egzersiz bazında</h3>
        <GameTable games={p.games} />
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold">Son oturumlar</h3>
        <ResultList results={data.results.slice(0, 15)} />
      </section>
    </div>
  );
}
