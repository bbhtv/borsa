"use client";

import { useState } from "react";
import { ExerciseCard, ExerciseLibrary } from "@/components/ui/ExerciseLibrary";
import { GAME_MAP } from "@/lib/catalog";

export default function TeacherLibrary() {
  const [open, setOpen] = useState<string | null>(null);
  const g = open ? GAME_MAP[open] : null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold text-slate">
        {Object.keys(GAME_MAP).length} egzersiz · her biri öğrencinin seviyesine göre otomatik zorlaşır ve sonuçları 4 gelişim alanına (tepki, dikkat, hafıza, matematik) ya da okuma hızına işlenir.
        Detay için bir karta tıklayın.
      </p>
      <ExerciseLibrary
        includeHidden
        render={(id) => (
          <button key={id} type="button" onClick={() => setOpen(id)} className="block text-left">
            <ExerciseCard id={id} />
          </button>
        )}
      />
      {g && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-surface p-6 shadow-lift" style={{ animation: "pop .25s both" }}>
            <div className="flex items-center gap-3">
              <span className="text-5xl">{g.emoji}</span>
              <div>
                <h3 className="text-2xl font-extrabold">{g.title}</h3>
                <p className="font-bold text-slate">{g.tag}</p>
              </div>
            </div>
            <h4 className="mt-4 text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Uygulama</h4>
            <ol className="mt-2 list-decimal space-y-1 pl-5 font-semibold">
              {g.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <h4 className="mt-4 text-sm font-extrabold uppercase tracking-widest text-brand-dark dark:text-logo">Bilimsel gerekçe</h4>
            <p className="mt-1 font-medium leading-relaxed text-slate">{g.why}</p>
            <button onClick={() => setOpen(null)} className="mt-5 w-full rounded-2xl bg-brand py-3 font-extrabold text-white">Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
