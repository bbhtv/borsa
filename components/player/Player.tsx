"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAME_MAP, CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/catalog";
import { DOMAIN_EMOJI, DOMAIN_SHORT, type Domain, type PlanItem, type StudentProfile } from "@/lib/types";
import { GAME_COMPONENTS } from "@/games";
import { Logo } from "@/components/ui/Logo";
import { sfx, unlockAudio, useKeys, type GameOutcome } from "@/components/game/kit";

export interface PlayerItem {
  gameId: string;
  planIndex?: number;
  source: PlanItem["source"] | "free";
  done?: boolean;
  score?: number;
}

type Phase = "intro" | "countdown" | "play" | "saving" | "result" | "finished";

interface ServerOutcome {
  xpGained: number;
  leveledUp: boolean;
  newTrainingWpm?: number;
  paceChange?: number;
  test?: { wpm: number; comprehension: number; ers: number; kind: string };
}

export function Player({
  items: initialItems,
  startIndex,
  mode,
  profile,
  onExit,
}: {
  items: PlayerItem[];
  startIndex: number;
  mode: "daily" | "single" | "onboarding";
  profile: StudentProfile;
  onExit: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(initialItems);
  const [idx, setIdx] = useState(Math.min(startIndex, initialItems.length - 1));
  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(3);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [server, setServer] = useState<ServerOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(profile.games).map(([k, v]) => [k, v.level]))
  );
  const [wpm, setWpm] = useState(profile.trainingWpm);
  const [testsTaken, setTestsTaken] = useState(profile.readingTests.length);
  const [playKey, setPlayKey] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [sound] = useState(profile.sound);
  const startedAt = useRef(0);
  const [session, setSession] = useState<{ gameId: string; score: number; summary: string }[]>([]);

  const item = items[idx];
  const meta = GAME_MAP[item?.gameId];
  const Game = item ? GAME_COMPONENTS[item.gameId] : null;
  const level = levels[item?.gameId] || 1;
  const cat = meta ? CATEGORY_COLOR[meta.category] : CATEGORY_COLOR.algi;

  /* ---------- fullscreen ---------- */
  useEffect(() => {
    const on = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const enterFs = useCallback(async () => {
    const el = rootRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el || document.fullscreenElement) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
      else el.webkitRequestFullscreen?.();
    } catch {
      /* not supported (e.g. iPhone) – the player already covers the viewport */
    }
  }, []);
  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else enterFs();
  }, [enterFs]);

  /* lock page scroll behind the player */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ---------- flow ---------- */
  function start() {
    unlockAudio();
    enterFs();
    setCount(3);
    setPhase("countdown");
  }
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      startedAt.current = performance.now();
      setPhase("play");
      return;
    }
    sfx.tick(sound, count === 1);
    const id = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(id);
  }, [phase, count, sound]);

  const save = useCallback(
    async (o: GameOutcome) => {
      setPhase("saving");
      setError(null);
      const seconds = (performance.now() - startedAt.current) / 1000;
      try {
        const res = await fetch("/api/student/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId: item.gameId,
            level,
            nextLevel: o.nextLevel,
            score: o.score,
            seconds,
            summary: o.summary,
            perf: o.perf,
            metrics: o.metrics,
            planIndex: item.planIndex,
            source: item.source,
            reading: o.reading,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
        setServer(data.outcome);
        setLevels((l) => ({ ...l, [item.gameId]: o.nextLevel }));
        if (data.profile?.trainingWpm) setWpm(data.profile.trainingWpm);
        if (item.gameId === "okuma-testi") setTestsTaken((n) => n + 1);
        setItems((list) => list.map((it, i) => (i === idx ? { ...it, done: true, score: o.score } : it)));
        setSession((s) => [...s, { gameId: item.gameId, score: o.score, summary: o.summary }]);
        sfx.done(sound);
        setPhase("result");
      } catch (e) {
        setError((e as Error).message);
        setPhase("result");
      }
    },
    [item, level, idx, sound]
  );

  function onFinish(o: GameOutcome) {
    setOutcome(o);
    save(o);
  }

  function nextItem() {
    setOutcome(null);
    setServer(null);
    setError(null);
    const nextIdx = items.findIndex((it, i) => i > idx && !it.done);
    if (mode === "single" || nextIdx === -1) {
      setPhase("finished");
      return;
    }
    setIdx(nextIdx);
    setPlayKey((k) => k + 1);
    setPhase("intro");
  }
  function retry() {
    setOutcome(null);
    setServer(null);
    setPlayKey((k) => k + 1);
    setPhase("intro");
  }
  function skip() {
    const nextIdx = items.findIndex((it, i) => i > idx && !it.done);
    if (nextIdx === -1) {
      const first = items.findIndex((it, i) => i !== idx && !it.done);
      if (first === -1) setPhase("finished");
      else setIdx(first);
    } else setIdx(nextIdx);
  }
  function exit() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onExit();
  }

  useKeys((e) => {
    if (e.key !== "Enter") return;
    if (phase === "intro") start();
    else if (phase === "result" && !error) nextItem();
  }, phase === "intro" || phase === "result");

  const doneCount = items.filter((i) => i.done).length;
  const position = idx + 1;

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex flex-col bg-deep-3 text-ink">
      {/* ---------- header ---------- */}
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 bg-deep px-3 sm:h-16 sm:px-5">
        <Logo white height={24} className="shrink-0" />
        <div className="mx-auto hidden min-w-0 items-center gap-2 text-white sm:flex">
          {meta && phase !== "finished" && (
            <>
              <span className="text-xl">{meta.emoji}</span>
              <span className="truncate text-base font-extrabold">{meta.title}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/70">Seviye {level}</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {mode !== "single" && (
            <span className="rounded-full bg-carrot px-3 py-1.5 text-sm font-extrabold tabular-nums text-ink" title="Bugünkü egzersiz sırası">
              {Math.min(position, items.length)}/{items.length}
            </span>
          )}
          <button
            type="button"
            onClick={toggleFs}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            aria-label={isFs ? "Tam ekrandan çık" : "Tam ekran"}
            title={isFs ? "Tam ekrandan çık" : "Tam ekran"}
          >
            {isFs ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M21 16v3a2 2 0 0 1-2 2h-3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /></svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (phase === "play" && !confirm("Egzersizden çıkılsın mı? Bu egzersizin sonucu kaydedilmeyecek.")) return;
              exit();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-rose-500"
            aria-label="Kapat"
            title="Kapat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </header>
      {mode !== "single" && (
        <div className="flex h-1.5 shrink-0 gap-0.5 bg-deep px-3 pb-0 sm:px-5">
          {items.map((it, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${it.done ? "bg-brand" : i === idx ? "bg-carrot" : "bg-white/15"}`} />
          ))}
        </div>
      )}

      {/* ---------- body ---------- */}
      <main className="relative min-h-0 flex-1 overflow-hidden bg-bg">
        {phase === "intro" && meta && (
          <Intro
            meta={meta}
            level={level}
            wpm={wpm}
            cat={cat}
            mode={mode}
            source={item.source}
            onStart={start}
            onSkip={mode === "daily" && items.filter((i) => !i.done).length > 1 ? skip : undefined}
          />
        )}

        {phase === "countdown" && (
          <div className="stage-dark flex h-full flex-col items-center justify-center gap-4 text-white">
            <span className="text-lg font-bold text-white/60">{meta?.title}</span>
            <span key={count} className="text-[140px] font-extrabold leading-none text-logo" style={{ animation: "pop .35s both" }}>
              {count || "🚀"}
            </span>
          </div>
        )}

        {(phase === "play" || phase === "saving") && Game && (
          <div className="h-full">
            <Game key={playKey} level={level} wpm={wpm} sound={sound} testsTaken={testsTaken} seed={(profile.games[item.gameId]?.plays || 0) + playKey * 3 + idx} onFinish={onFinish} />
            {phase === "saving" && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-deep/60 backdrop-blur-sm">
                <span className="rounded-2xl bg-white px-6 py-4 text-lg font-extrabold shadow-lift">Sonuç kaydediliyor…</span>
              </div>
            )}
          </div>
        )}

        {phase === "result" && outcome && meta && (
          <Result
            meta={meta}
            outcome={outcome}
            server={server}
            error={error}
            mode={mode}
            hasNext={items.some((it, i) => i > idx && !it.done) || items.some((it, i) => i !== idx && !it.done)}
            onNext={nextItem}
            onRetry={retry}
            onSaveAgain={() => save(outcome)}
            onExit={exit}
          />
        )}

        {phase === "finished" && <Finished mode={mode} session={session} done={doneCount} total={items.length} onExit={exit} onMore={mode === "single" ? retry : undefined} />}
      </main>
    </div>
  );
}

/* ====================================================================== */
function Intro({
  meta,
  level,
  wpm,
  cat,
  mode,
  source,
  onStart,
  onSkip,
}: {
  meta: (typeof GAME_MAP)[string];
  level: number;
  wpm: number;
  cat: { bg: string; fg: string };
  mode: string;
  source: PlayerItem["source"];
  onStart: () => void;
  onSkip?: () => void;
}) {
  const doms = Object.entries(meta.domains).filter(([, w]) => (w ?? 0) > 0) as [Domain | "reading", number][];
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1.2fr_1fr]" style={{ animation: "fadeUp .4s both" }}>
        <section className="flex flex-col gap-5 rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] text-5xl" style={{ background: cat.bg }}>
              {meta.emoji}
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap gap-1.5">
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold" style={{ background: cat.bg, color: cat.fg }}>
                  {CATEGORY_LABEL[meta.category]}
                </span>
                {source === "teacher" && <span className="rounded-full bg-grape px-2.5 py-0.5 text-[11px] font-extrabold text-white">Eğitmen ödevi</span>}
                {source === "test" && <span className="rounded-full bg-carrot px-2.5 py-0.5 text-[11px] font-extrabold text-ink">Ölçüm</span>}
              </div>
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{meta.title}</h2>
              <p className="font-bold text-slate">{meta.tag}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip>⏱ ~{Math.round(meta.seconds / 6) / 10 >= 1 ? `${Math.round(meta.seconds / 60)} dk` : `${meta.seconds} sn`}</Chip>
            {meta.id !== "okuma-testi" && <Chip>📈 Seviye {level}</Chip>}
            {meta.category === "okuma" && meta.id !== "okuma-testi" && <Chip tone="carrot">⚡ Hızın: {wpm} kelime/dk · otomatik</Chip>}
            {(meta.category === "goz" || meta.id === "genisleyen-cerceve") && <Chip tone="carrot">🎵 Tempo okuma hızına göre ayarlı</Chip>}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-brand-dark">Nasıl yapılır?</h3>
            <ol className="flex flex-col gap-3">
              {meta.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">{i + 1}</span>
                  <span className="pt-0.5 text-[15.5px] font-semibold leading-relaxed text-ink">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          {meta.keys && (
            <p className="hidden rounded-2xl bg-bg px-4 py-3 text-sm font-bold text-slate sm:block">
              ⌨️ Klavye: <span className="text-ink">{meta.keys}</span>
            </p>
          )}
        </section>
        <aside className="flex flex-col gap-5">
          <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-deep-2 to-deep p-6 text-white shadow-card sm:p-7">
            <span className="absolute -right-6 -top-6 text-8xl opacity-10">🧠</span>
            <h3 className="mb-2 text-sm font-extrabold uppercase tracking-widest text-logo">Neden işe yarar?</h3>
            <p className="text-[15px] font-medium leading-relaxed text-white/85">{meta.why}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {doms.map(([d]) => (
                <span key={d} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold">
                  {d === "reading" ? "📖 Okuma hızı" : `${DOMAIN_EMOJI[d]} ${DOMAIN_SHORT[d]}`}
                </span>
              ))}
            </div>
          </section>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onStart}
              className="btn-3d flex h-16 items-center justify-center gap-3 rounded-[22px] bg-brand text-xl font-extrabold text-white shadow-[0_7px_0_#07879B] hover:brightness-105 active:shadow-none"
              style={{ animation: "pulseRing 1.8s infinite" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="6 3 20 12 6 21 6 3" /></svg>
              {mode === "onboarding" && meta.id === "okuma-testi" ? "Ölçüme Başla" : "Başla"}
            </button>
            {onSkip && (
              <button type="button" onClick={onSkip} className="h-11 rounded-2xl text-sm font-extrabold text-slate hover:bg-white">
                Bu egzersizi sonraya bırak →
              </button>
            )}
            <p className="text-center text-xs font-semibold text-muted">Başla'ya bastığında egzersiz tam ekrana geçer. Enter tuşu da çalışır.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "carrot" }) {
  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${tone === "carrot" ? "bg-peach text-ink" : "bg-bg text-ink"}`}>{children}</span>
  );
}

/* ====================================================================== */
function Ring({ value, size = 150 }: { value: number; size?: number }) {
  const r = 62;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? "#16A34A" : value >= 55 ? "#0AB4CC" : "#FF9F1C";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 150 150" width={size} height={size} className="-rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#E2EAEC" strokeWidth="12" />
        <circle cx="75" cy="75" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold">{value}</span>
        <span className="text-xs font-bold text-muted">puan</span>
      </div>
    </div>
  );
}

function Result({
  meta,
  outcome,
  server,
  error,
  mode,
  hasNext,
  onNext,
  onRetry,
  onSaveAgain,
  onExit,
}: {
  meta: (typeof GAME_MAP)[string];
  outcome: GameOutcome;
  server: ServerOutcome | null;
  error: string | null;
  mode: string;
  hasNext: boolean;
  onNext: () => void;
  onRetry: () => void;
  onSaveAgain: () => void;
  onExit: () => void;
}) {
  const s = outcome.score;
  const title = s >= 85 ? "Muhteşem! 🏆" : s >= 65 ? "Harika iş! 🥕" : s >= 45 ? "İyi gidiyorsun! 💪" : "Devam, gelişiyorsun! 🌱";
  const isTest = meta.id === "okuma-testi";
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-8 text-center" style={{ animation: "fadeUp .4s both" }}>
        <Ring value={s} />
        <div>
          <h2 className="text-3xl font-extrabold">{isTest ? "Ölçüm tamamlandı 📏" : title}</h2>
          <p className="mt-1 font-bold text-slate">{outcome.summary}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {outcome.highlights.map((h) => (
            <div key={h.label} className="rounded-2xl border border-line bg-white p-3 shadow-card">
              <div className="text-xl font-extrabold">{h.value}</div>
              <div className="text-xs font-bold text-muted">{h.label}</div>
            </div>
          ))}
        </div>
        {server && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-peach px-3 py-1.5 text-sm font-extrabold">+{server.xpGained} XP</span>
              {server.leveledUp && <span className="rounded-full bg-carrot px-3 py-1.5 text-sm font-extrabold">🎉 Yeni seviye!</span>}
              {outcome.nextLevel !== undefined && !isTest && meta.category !== "okuma" && <span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-extrabold">Sonraki zorluk: {outcome.nextLevel}</span>}
            </div>
            {server.newTrainingWpm != null && (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate ring-1 ring-line">
                {server.paceChange && server.paceChange > 0
                  ? `Anlaman iyi olduğu için antrenman hızın ${server.newTrainingWpm} kelime/dk'ya çıkarıldı (+${server.paceChange}).`
                  : server.paceChange && server.paceChange < 0
                    ? `Anlamayı korumak için antrenman hızın ${server.newTrainingWpm} kelime/dk'ya düşürüldü.`
                    : `Antrenman hızın ${server.newTrainingWpm} kelime/dk'da kaldı.`}
              </p>
            )}
            {server.test && (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate ring-1 ring-line">
                {server.test.kind === "placement"
                  ? `Başlangıç ölçümün kaydedildi. Tüm egzersiz hızların ${server.test.wpm} kelime/dk ve %${Math.round(server.test.comprehension * 100)} anlama sonucuna göre otomatik ayarlandı.`
                  : "Haftalık ölçümün kaydedildi. Gelişim grafiğin güncellendi."}
              </p>
            )}
          </div>
        )}
        {error && (
          <div className="w-full rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
            Sonuç kaydedilemedi: {error}
            <button type="button" onClick={onSaveAgain} className="ml-2 underline">
              Tekrar dene
            </button>
          </div>
        )}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {mode === "single" ? (
            <>
              <button type="button" onClick={onRetry} className="h-14 rounded-2xl border border-line bg-white text-lg font-extrabold shadow-card">
                ↻ Tekrar oyna
              </button>
              <button type="button" onClick={onExit} className="btn-3d h-14 rounded-2xl bg-brand text-lg font-extrabold text-white shadow-[0_6px_0_#07879B]">
                Bitir
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onExit} className="h-14 rounded-2xl border border-line bg-white text-lg font-extrabold shadow-card">
                Panele dön
              </button>
              <button type="button" disabled={!!error} onClick={onNext} className="btn-3d h-14 rounded-2xl bg-brand text-lg font-extrabold text-white shadow-[0_6px_0_#07879B] disabled:opacity-50">
                {hasNext ? "Sonraki egzersiz →" : "Bitir 🎉"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Finished({
  mode,
  session,
  done,
  total,
  onExit,
  onMore,
}: {
  mode: string;
  session: { gameId: string; score: number; summary: string }[];
  done: number;
  total: number;
  onExit: () => void;
  onMore?: () => void;
}) {
  const avgScore = useMemo(() => (session.length ? Math.round(session.reduce((s, x) => s + x.score, 0) / session.length) : 0), [session]);
  return (
    <div className="stage-dark h-full overflow-y-auto text-white">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-10 text-center" style={{ animation: "fadeUp .4s both" }}>
        <div className="text-7xl" style={{ animation: "float 3s ease-in-out infinite" }}>
          🐰
        </div>
        <h2 className="text-3xl font-extrabold">
          {mode === "onboarding" ? "Başlangıç değerlendirmen tamam!" : done >= total ? "Bugünün antrenmanı tamamlandı!" : "Harika bir oturumdu!"}
        </h2>
        <p className="font-semibold text-white/70">
          {mode === "onboarding"
            ? "Artık tüm egzersizler senin ölçülen hızına ve seviyene göre otomatik ayarlanacak. Gelişimin her gün hesaplanıyor."
            : `${session.length} egzersiz · ortalama puan ${avgScore}`}
        </p>
        {session.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {session.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left">
                <span className="text-2xl">{GAME_MAP[s.gameId]?.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{GAME_MAP[s.gameId]?.title}</span>
                  <span className="block truncate text-xs font-semibold text-white/60">{s.summary}</span>
                </span>
                <span className="rounded-full bg-logo px-2.5 py-1 text-sm font-extrabold text-ink">{s.score}</span>
              </div>
            ))}
          </div>
        )}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {onMore && (
            <button type="button" onClick={onMore} className="h-14 rounded-2xl bg-white/10 text-lg font-extrabold">
              ↻ Tekrar oyna
            </button>
          )}
          <button type="button" onClick={onExit} className={`btn-3d h-14 rounded-2xl bg-brand text-lg font-extrabold text-white shadow-[0_6px_0_#07879B] ${onMore ? "" : "sm:col-span-2"}`}>
            Panele dön
          </button>
        </div>
      </div>
    </div>
  );
}
