"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPOTS: [number, number][] = [
  [10, 14], [90, 14], [90, 86], [10, 86], [50, 50], [90, 50], [10, 50], [50, 14], [50, 86],
];

export function HeroDevice() {
  const [i, setI] = useState(0);
  const [wpm, setWpm] = useState(186);
  useEffect(() => {
    const a = setInterval(() => setI((x) => x + 1), 650);
    const b = setInterval(() => setWpm((w) => (w >= 264 ? 186 : w + 2)), 90);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  const [x, y] = SPOTS[i % SPOTS.length];
  const carrot = i % 7 === 6;
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-10 rounded-full bg-logo/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[34px] border border-white/15 bg-deep-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]">
        <div className="flex items-center gap-2 bg-deep px-4 py-3">
          <Image src="/logo-white.png" alt="" width={80} height={21} style={{ height: 18, width: "auto" }} />
          <span className="ml-auto rounded-full bg-carrot px-2.5 py-1 text-xs font-extrabold text-night">5/12</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M3 8V5a2 2 0 0 1 2-2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M21 16v3a2 2 0 0 1-2 2h-3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /></svg>
          </span>
        </div>
        <div className="flex gap-0.5 bg-deep px-4 pb-2">
          {Array.from({ length: 12 }, (_, k) => (
            <span key={k} className={`h-1 flex-1 rounded-full ${k < 4 ? "bg-brand" : k === 4 ? "bg-carrot" : "bg-white/15"}`} />
          ))}
        </div>
        <div className="stage-dark p-4">
          <div className="grid-bg relative aspect-[16/10] rounded-[22px] border-2 border-white/10">
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 text-4xl transition-all duration-150 sm:text-5xl"
              style={{ left: `${x}%`, top: `${y}%`, filter: carrot ? "drop-shadow(0 0 16px rgba(255,159,28,.9))" : undefined }}
            >
              {carrot ? "🥕" : "🐰"}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -left-4 top-1/3 hidden rounded-2xl border border-white/10 bg-white/95 px-4 py-3 shadow-lift sm:block" style={{ animation: "float 5s ease-in-out infinite" }}>
        <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#64748B]">Okuma hızı</div>
        <div className="text-2xl font-extrabold tabular-nums text-night">
          {wpm} <span className="text-sm text-[#64748B]">k/dk</span>
        </div>
        <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-300">+%{Math.round((wpm / 186 - 1) * 100)} · anlama %88</div>
      </div>
      <div className="absolute -right-3 -bottom-6 hidden flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/95 p-3 shadow-lift sm:flex" style={{ animation: "float 6s ease-in-out infinite .8s" }}>
        {[
          ["⚡ Tepki", 22, "#E8890C"],
          ["🎯 Dikkat", 31, "#0AA5BC"],
          ["🧠 Hafıza", 18, "#6D4AE8"],
          ["➗ Matematik", 27, "#16A34A"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="flex items-center gap-2 text-xs font-extrabold text-night">
            <span className="w-[86px]">{l}</span>
            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[#EEF4F5]">
              <span className="block h-full rounded-full" style={{ width: `${(v as number) * 2.5}%`, background: c as string }} />
            </span>
            <span className="w-10 text-right tabular-nums">+%{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
