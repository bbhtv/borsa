"use client";

import Link from "next/link";
import { useStudent } from "@/components/student/StudentContext";
import { DomainGrid, ProgressRing, ReadingCard, fmtPct } from "@/components/ui/charts";
import { CATEGORY_COLOR, CATEGORY_LABEL, GAME_MAP } from "@/lib/catalog";
import { WeekGoal } from "@/components/ui/WeekGoal";

export default function StudentHome() {
  const { data } = useStudent();
  if (!data) return null;
  const plan = data.plan;
  const items = plan?.items || [];
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const allDone = total > 0 && done === total;
  const minutes = Math.round(items.filter((i) => !i.done).reduce((s, i) => s + (GAME_MAP[i.gameId]?.seconds || 60) + 25, 0) / 60);

  return (
    <div className="flex flex-col gap-5">
      {/* hero */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-deep-2 to-deep p-5 text-white shadow-card sm:p-7">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <ProgressRing value={total ? done / total : 0} size={112} stroke={11} color="#19E3F9" track="rgba(255,255,255,.12)">
            <span className="text-center">
              <span className="block text-2xl font-extrabold leading-none">{done}/{total}</span>
              <span className="text-[10px] font-bold text-white/60">egzersiz</span>
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold tracking-wide">BUGÜNÜN ANTRENMANI</span>
            <h2 className="mt-2 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
              {allDone ? "Bugünü tamamladın! Harikasın 🎉" : done > 0 ? "Kaldığın yerden devam et" : `${total} adımlık kişisel programın hazır`}
            </h2>
            <p className="mt-1 text-sm font-semibold text-white/70">
              {allDone
                ? "Yarın yeni bir program seni bekliyor. İstersen kütüphaneden serbest egzersiz yapabilirsin."
                : `Göz ısınması → algı → okuma → bilişsel oyunlar · yaklaşık ${minutes} dk · hız ${data.profile.trainingWpm} k/dk (otomatik)`}
            </p>
          </div>
          {!allDone ? (
            <Link
              href="/ogrenci/calis?mod=gunluk"
              className="btn-3d flex items-center gap-2 rounded-[20px] bg-brand px-7 py-4 text-xl font-extrabold text-white shadow-[0_6px_0_#07879B] hover:brightness-110"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="6 3 20 12 6 21 6 3" /></svg>
              {done > 0 ? "Devam Et" : "Başlat"}
            </Link>
          ) : (
            <Link href="/ogrenci/egzersizler" className="rounded-[20px] bg-white/10 px-6 py-4 font-extrabold hover:bg-white/20">
              Serbest egzersiz →
            </Link>
          )}
        </div>
      </section>

      {data.assignments.length > 0 && (
        <section className="flex flex-col gap-2 rounded-[24px] border-2 border-grape/30 bg-grape/10 p-4">
          {data.assignments.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <span className="text-2xl">📌</span>
              <div className="min-w-0">
                <div className="font-extrabold">Eğitmeninden: {a.title}</div>
                {a.note && <div className="text-sm font-semibold text-slate">{a.note}</div>}
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.gameIds.map((g) => (
                    <span key={g} className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold ring-1 ring-line">
                      {GAME_MAP[g]?.emoji} {GAME_MAP[g]?.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        {/* plan list */}
        <section className="flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-4 shadow-card sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Bugünün Programı</h3>
            <span className="text-sm font-extrabold text-slate">{done}/{total}</span>
          </div>
          <ol className="flex flex-col gap-2">
            {items.map((it, i) => {
              const m = GAME_MAP[it.gameId];
              if (!m) return null;
              const c = CATEGORY_COLOR[m.category];
              const next = !it.done && items.findIndex((x) => !x.done) === i;
              return (
                <li key={i}>
                  <Link
                    href={`/ogrenci/calis?mod=gunluk&i=${i}`}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 transition hover:-translate-y-0.5 ${
                      next ? "border-brand bg-brand-soft/60" : it.done ? "border-transparent bg-bg" : "border-line bg-surface"
                    }`}
                  >
                    <span className="w-5 text-center text-xs font-extrabold text-muted">{i + 1}</span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: c.bg }}>
                      {m.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14.5px] font-extrabold ${it.done ? "text-slate" : ""}`}>{m.title}</span>
                      <span className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold" style={{ color: c.fg }}>
                        {CATEGORY_LABEL[m.category]}
                        {it.source === "teacher" && <span className="rounded-full bg-grape px-1.5 text-white">Eğitmen</span>}
                        {it.source === "test" && <span className="rounded-full bg-carrot px-1.5 text-night">Ölçüm</span>}
                      </span>
                    </span>
                    {it.done ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">✓ {it.score}</span>
                    ) : (
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${next ? "bg-brand text-white" : "bg-bg text-slate"}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="flex flex-col gap-5">
          <WeekGoal profile={data.profile} />
          <ReadingCard reading={data.reading} dark />
          {data.reading.nextTestDue && (
            <div className="rounded-2xl bg-peach px-4 py-3 text-sm font-bold ring-1 ring-carrot/40">
              📏 Haftalık okuma ölçümün bugünkü programa eklendi. Gelişimini görmek için tamamla!
            </div>
          )}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-extrabold">Bilişsel Gelişim</h3>
              <span className="text-sm font-extrabold text-slate">Genel: {fmtPct(data.overall)}</span>
            </div>
            <DomainGrid domains={data.domains} history={data.profile.history} compact />
          </section>
        </div>
      </div>
    </div>
  );
}
