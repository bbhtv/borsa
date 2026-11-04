"use client";

import { dayKey } from "@/lib/engine";
import type { StudentProfile } from "@/lib/types";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const WEEKLY_GOAL = 5;

export function weekDays(): string[] {
  const today = dayKey();
  const t = Date.parse(today + "T00:00:00Z");
  const offset = (new Date(t).getUTCDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 7 }, (_, i) => new Date(t + (i - offset) * 86400000).toISOString().slice(0, 10));
}

export function activeDays(p: StudentProfile): Set<string> {
  const s = new Set(p.history.map((h) => h.day));
  (p.bookLog || []).forEach((b) => s.add(dayKey(b.at)));
  return s;
}

/** Weekly practice goal – research favours short, frequent sessions over long, rare ones. */
export function WeekGoal({ profile }: { profile: StudentProfile }) {
  const week = weekDays();
  const active = activeDays(profile);
  const today = dayKey();
  const done = week.filter((d) => active.has(d)).length;
  const reached = done >= WEEKLY_GOAL;
  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-extrabold">🎯 Haftalık hedef</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${reached ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-bg text-slate"}`}>
          {done}/{WEEKLY_GOAL} gün {reached ? "✓" : ""}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((d, i) => {
          const on = active.has(d);
          const isToday = d === today;
          return (
            <div key={d} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                  on ? "bg-brand text-white" : isToday ? "border-2 border-dashed border-brand text-brand-dark dark:text-logo" : "bg-bg text-muted"
                }`}
              >
                {on ? "✓" : ""}
              </span>
              <span className={`text-[10.5px] font-bold ${isToday ? "text-ink" : "text-muted"}`}>{DAYS[i]}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[11.5px] font-semibold text-muted">Kısa ama sık çalışmak, seyrek uzun çalışmaktan daha etkilidir. Haftada en az {WEEKLY_GOAL} gün hedefle.</p>
    </section>
  );
}

export function BookSummary({ profile, limit = 8 }: { profile: StudentProfile; limit?: number }) {
  const log = profile.bookLog || [];
  if (!log.length) return <p className="rounded-2xl bg-bg p-4 text-sm font-bold text-muted">Henüz kitap okuma kaydı yok. Okuma Odası’ndan kronometreyle kaydedilebilir.</p>;
  const pages = log.reduce((a, b) => a + b.pages, 0);
  const mins = Math.round(log.reduce((a, b) => a + b.seconds, 0) / 60);
  const books = new Set(log.map((b) => b.title.toLocaleLowerCase("tr"))).size;
  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-surface p-4 shadow-card">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Kitap", books],
          ["Sayfa", pages],
          ["Süre", `${mins} dk`],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl bg-bg p-2.5">
            <div className="text-xl font-extrabold tabular-nums">{v}</div>
            <div className="text-[11px] font-bold text-muted">{l}</div>
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {log.slice(0, limit).map((e) => (
          <li key={e.id} className="flex items-center gap-2 rounded-xl bg-bg px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate font-extrabold">{e.title}</span>
            <span className="font-bold text-slate">{new Date(e.at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
            <span className="font-bold text-slate">{e.pages} s</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-extrabold">{e.wpm} k/dk</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
