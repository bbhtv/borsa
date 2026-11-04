"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlokOkuma, GolgeOkuma, RehberliOkuma } from "@/games/reading";
import { Logo } from "@/components/ui/Logo";
import { unlockAudio, type GameOutcome } from "@/components/game/kit";
import type { StudentProfile } from "@/lib/types";

export type FreeMode = "rehberli" | "blok" | "golge";

/** Full-screen reader for the student's own text. Pace is the automatic training pace. */
export function FreeReader({
  title,
  body,
  mode,
  profile,
  onClose,
}: {
  title: string;
  body: string;
  mode: FreeMode;
  profile: StudentProfile;
  onClose: (saved: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"ready" | "read" | "done">("ready");
  const [result, setResult] = useState<{ words: number; seconds: number } | null>(null);
  const [isFs, setIsFs] = useState(false);
  const Game = mode === "blok" ? BlokOkuma : mode === "golge" ? GolgeOkuma : RehberliOkuma;
  const custom = useRef({ title, body }).current;

  useEffect(() => {
    const on = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("fullscreenchange", on);
      document.body.style.overflow = prev;
    };
  }, []);
  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);
  const close = (saved: boolean) => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onClose(saved);
  };

  async function finish(o: GameOutcome) {
    const words = o.reading?.words || 0;
    const seconds = Math.round(o.reading?.seconds || 0);
    setResult({ words, seconds });
    setPhase("done");
    await fetch("/api/student/free-reading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ words, seconds }) }).catch(() => {});
  }

  const rp = profile.readingPrefs;
  const vars = {
    ["--read-font" as string]: rp?.font === "lexend" ? "var(--font-lexend), var(--font-sans)" : rp?.font === "serif" ? "var(--font-literata), Georgia, serif" : "var(--font-sans)",
    ["--read-scale" as string]: rp?.size === "xl" ? 1.3 : rp?.size === "l" ? 1.15 : 1,
    ["--read-leading" as string]: rp?.spacing === "wide" ? 1.15 : 1,
  } as React.CSSProperties;

  return (
    <div ref={rootRef} className={`fixed inset-0 z-50 flex flex-col bg-deep-3 ${rp?.colorLines ? "color-lines" : ""}`} style={vars}>
      <header className="flex h-14 shrink-0 items-center gap-3 bg-deep px-3 sm:h-16 sm:px-5">
        <Logo white height={24} />
        <span className="mx-auto hidden truncate text-base font-extrabold text-white sm:block">📖 {title}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-carrot px-3 py-1.5 text-sm font-extrabold text-night">⚡ {profile.trainingWpm} k/dk</span>
          <button type="button" onClick={toggleFs} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20" aria-label="Tam ekran">
            {isFs ? "⤡" : "⤢"}
          </button>
          <button type="button" onClick={() => close(phase === "done")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-rose-500" aria-label="Kapat">
            ✕
          </button>
        </div>
      </header>
      <main className="relative min-h-0 flex-1 overflow-hidden bg-bg">
        {phase === "ready" && (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="text-6xl">📖</div>
            <h2 className="text-3xl font-extrabold text-ink">{title}</h2>
            <p className="max-w-md font-semibold text-slate">
              Metnin senin antrenman hızında ({profile.trainingWpm} kelime/dk) akacak. Hızı program otomatik belirler; gözünü rehberden ayırma.
            </p>
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                rootRef.current?.requestFullscreen?.().catch(() => {});
                setPhase("read");
              }}
              className="btn-3d rounded-[20px] bg-brand px-10 py-4 text-xl font-extrabold text-white shadow-[0_6px_0_#07879B]"
            >
              Başla
            </button>
          </div>
        )}
        {phase === "read" && (
          <div className="h-full">
            <Game level={5} wpm={profile.trainingWpm} sound={profile.sound} testsTaken={0} seed={0} customText={custom} onFinish={finish} />
          </div>
        )}
        {phase === "done" && result && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-extrabold text-ink">Metni bitirdin!</h2>
            <p className="font-semibold text-slate">
              {result.words} kelime · {Math.floor(result.seconds / 60)} dk {result.seconds % 60} sn
            </p>
            <p className="max-w-md text-sm font-semibold text-muted">
              Kendi metinlerin okuma pratiği olarak kaydedilir. Hızın ise ölçümler ve anlama sorulu egzersizlerle güncellenir.
            </p>
            <button type="button" onClick={() => close(true)} className="btn-3d rounded-2xl bg-brand px-8 py-3 text-lg font-extrabold text-white shadow-[0_5px_0_#07879B]">
              Tamam
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
