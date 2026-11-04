"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/content/texts";
import { sfx, shuffle } from "./kit";

export function Quiz({
  questions: raw,
  sound,
  onDone,
  title = "Anlama Soruları",
}: {
  questions: Question[];
  sound: boolean;
  onDone: (correct: number) => void;
  title?: string;
}) {
  // shuffle answer order every time so the correct option is never predictable
  const questions = useMemo(
    () =>
      raw.map((q) => {
        const order = shuffle(q.options.map((_, k) => k));
        return { q: q.q, options: order.map((k) => q.options[k]), a: order.indexOf(q.a) };
      }),
    [raw]
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[i];

  function choose(k: number) {
    if (picked != null) return;
    setPicked(k);
    const ok = k === q.a;
    if (ok) sfx.good(sound);
    else sfx.bad(sound);
    const nextCorrect = correct + (ok ? 1 : 0);
    setCorrect(nextCorrect);
    setTimeout(() => {
      if (i + 1 >= questions.length) onDone(nextCorrect);
      else {
        setI(i + 1);
        setPicked(null);
      }
    }, 900);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold uppercase tracking-widest text-brand-dark">{title}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink ring-1 ring-line">
          {i + 1} / {questions.length}
        </span>
      </div>
      <h3 className="text-balance text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{q.q}</h3>
      <div className="grid gap-3">
        {q.options.map((o, k) => {
          const state = picked == null ? "idle" : k === q.a ? "right" : k === picked ? "wrong" : "dim";
          return (
            <button
              key={k}
              type="button"
              onClick={() => choose(k)}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-bold transition sm:text-lg ${
                state === "idle"
                  ? "border-line bg-white hover:-translate-y-0.5 hover:border-brand"
                  : state === "right"
                    ? "border-emerald-500 bg-emerald-50"
                    : state === "wrong"
                      ? "shake border-rose-500 bg-rose-50"
                      : "border-line bg-white opacity-50"
              }`}
            >
              <span
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-xl text-sm font-extrabold ${
                  state === "right" ? "bg-emerald-500 text-white" : state === "wrong" ? "bg-rose-500 text-white" : "bg-brand-soft text-deep"
                }`}
              >
                {"ABCD"[k]}
              </span>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
