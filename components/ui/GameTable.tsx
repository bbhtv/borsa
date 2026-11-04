"use client";

import { GAME_MAP } from "@/lib/catalog";
import { gameImprovement } from "@/lib/engine";
import { DOMAINS, type GameResult, type GameStat } from "@/lib/types";
import { fmtPct } from "./charts";

export function GameTable({ games }: { games: Record<string, GameStat> }) {
  const rows = Object.entries(games)
    .filter(([id]) => GAME_MAP[id])
    .sort((a, b) => b[1].plays - a[1].plays);
  if (!rows.length) return <p className="rounded-2xl bg-bg p-4 text-sm font-bold text-muted">Henüz egzersiz yapılmadı.</p>;
  return (
    <div className="overflow-x-auto rounded-[22px] border border-line bg-white shadow-card">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-bg text-xs font-extrabold uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Egzersiz</th>
            <th className="px-3 py-3 text-right">Oturum</th>
            <th className="px-3 py-3 text-right">Seviye</th>
            <th className="px-3 py-3 text-right">En iyi</th>
            <th className="px-4 py-3 text-right">Gelişim</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([id, st]) => {
            const m = GAME_MAP[id];
            const keys = [...DOMAINS, "reading" as const].filter((d) => m.domains[d]);
            const imps = keys.map((d) => gameImprovement(st, d)).filter((x): x is number => x != null);
            const imp = imps.length ? (imps.reduce((s, x) => s + x, 0) / imps.length) * 100 : null;
            return (
              <tr key={id} className="border-t border-line">
                <td className="px-4 py-2.5 font-extrabold">
                  <span className="mr-2">{m.emoji}</span>
                  {m.title}
                </td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums">{st.plays}</td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums">{st.level}</td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums">{st.bestScore}</td>
                <td className={`px-4 py-2.5 text-right font-extrabold tabular-nums ${imp != null && imp < 0 ? "text-carrot-dark" : ""}`}>
                  {imp == null ? <span className="text-muted">ölçülüyor</span> : fmtPct(imp)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ResultList({ results }: { results: GameResult[] }) {
  if (!results.length) return <p className="rounded-2xl bg-bg p-4 text-sm font-bold text-muted">Henüz oturum yok.</p>;
  return (
    <div className="flex flex-col gap-2">
      {results.map((r) => {
        const m = GAME_MAP[r.gameId];
        return (
          <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5 shadow-card">
            <span className="text-xl">{m?.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">
                {m?.title}
                {r.source === "teacher" && <span className="ml-2 rounded-full bg-grape px-1.5 text-[10px] text-white">Ödev</span>}
              </div>
              <div className="truncate text-xs font-semibold text-slate">{r.summary}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-extrabold">{r.score}</div>
              <div className="text-[10.5px] font-bold text-muted">
                {new Date(r.at).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
