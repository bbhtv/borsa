"use client";

import { CATEGORY_COLOR, CATEGORY_LABEL, GAMES, type Category } from "@/lib/catalog";
import { DOMAIN_EMOJI, DOMAIN_SHORT, type Domain, type GameStat } from "@/lib/types";

const ORDER: Category[] = ["goz", "algi", "dikkat", "hafiza", "matematik", "dil", "okuma"];

export function ExerciseCard({ id, stat, selected }: { id: string; stat?: GameStat; selected?: boolean }) {
  const g = GAMES.find((x) => x.id === id)!;
  const c = CATEGORY_COLOR[g.category];
  return (
    <div
      className={`flex h-full flex-col gap-2 rounded-[22px] border-2 p-4 text-left shadow-card transition hover:-translate-y-1 ${selected ? "border-brand ring-4 ring-brand/20" : "border-transparent"}`}
      style={{ background: c.bg }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-2xl">{g.emoji}</span>
        {selected && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">✓</span>}
        {!selected && stat && <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-extrabold">Zorluk {stat.level}</span>}
      </div>
      <span className="text-[15px] font-extrabold leading-tight text-ink">{g.title}</span>
      <span className="text-xs font-bold text-slate">{g.tag}</span>
      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {(Object.keys(g.domains) as (Domain | "reading")[]).map((d) => (
          <span key={d} className="rounded-full bg-surface/80 px-2 py-0.5 text-[10.5px] font-extrabold text-ink">
            {d === "reading" ? "📖 Okuma" : `${DOMAIN_EMOJI[d]} ${DOMAIN_SHORT[d]}`}
          </span>
        ))}
      </div>
      {stat && <span className="text-[11px] font-bold" style={{ color: c.fg }}>{stat.plays} oturum · en iyi {stat.bestScore}</span>}
    </div>
  );
}

export function ExerciseLibrary({
  stats = {},
  render,
  includeHidden,
}: {
  stats?: Record<string, GameStat>;
  render: (id: string, card: React.ReactNode) => React.ReactNode;
  includeHidden?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {ORDER.map((cat) => {
        const list = GAMES.filter((g) => g.category === cat && (includeHidden || !g.hidden));
        if (!list.length) return null;
        return (
          <section key={cat} className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-lg font-extrabold">
              <span className="h-3 w-3 rounded-full" style={{ background: CATEGORY_COLOR[cat].fg }} />
              {CATEGORY_LABEL[cat]}
              <span className="text-sm font-bold text-muted">· {list.length}</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {list.map((g) => render(g.id, <ExerciseCard id={g.id} stat={stats[g.id]} />))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
