"use client";

import { useState } from "react";
import { CATEGORY_COLOR, CATEGORY_LABEL, GAMES, type Category } from "@/lib/catalog";

const CATS: (Category | "all")[] = ["all", "goz", "algi", "dikkat", "hafiza", "matematik", "okuma"];

export function ExerciseShowcase() {
  const [cat, setCat] = useState<Category | "all">("all");
  const list = GAMES.filter((g) => cat === "all" || g.category === cat);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${cat === c ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-brand"}`}
          >
            {c === "all" ? `Tümü · ${GAMES.length}` : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((g) => (
          <div key={g.id} className="group flex flex-col gap-2 rounded-[22px] border border-line bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-lift" style={{ animation: "fadeUp .4s both" }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition group-hover:scale-110" style={{ background: CATEGORY_COLOR[g.category].bg }}>
              {g.emoji}
            </span>
            <span className="font-extrabold leading-tight">{g.title}</span>
            <span className="text-xs font-bold text-slate">{g.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
