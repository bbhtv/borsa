"use client";

import { useEffect, useRef, useState } from "react";
import { levelFactor, nextLevelFrom, speedIndex } from "@/lib/engine";
import { WORDS, similarWord, wordsOfLength } from "@/content/words";
import {
  BigChoice,
  Flash,
  Hud,
  Pill,
  Stage,
  TimeLeft,
  avg,
  clamp,
  ms,
  pct,
  pick,
  r2,
  sfx,
  shuffle,
  useCountdown,
  useKeys,
  useTimers,
  type GameProps,
} from "@/components/game/kit";

/* ============================================================
   Şimşek Kelime – tachistoscope with adaptive staircase
   ============================================================ */
function stimulusFor(level: number): string {
  if (level <= 4) return pick(wordsOfLength(3, 6));
  if (level <= 9) return pick(wordsOfLength(6, 10));
  if (level <= 14) return `${pick(wordsOfLength(3, 6))} ${pick(wordsOfLength(4, 7))}`;
  return `${pick(wordsOfLength(3, 5))} ${pick(wordsOfLength(3, 6))} ${pick(wordsOfLength(3, 6))}`;
}
function variantOf(s: string) {
  const parts = s.split(" ");
  const k = Math.floor(Math.random() * parts.length);
  parts[k] = similarWord(parts[k]);
  return parts.join(" ");
}

export function SimsekKelime({ level, sound, onFinish }: GameProps) {
  const TRIALS = 16;
  const startExposure = clamp(520 - level * 22, 70, 520);
  const [phase, setPhase] = useState<"fix" | "show" | "mask" | "ask">("fix");
  const [trial, setTrial] = useState(0);
  const [stim, setStim] = useState("");
  const [opts, setOpts] = useState<string[]>([]);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const exposure = useRef(startExposure);
  const res = useRef({ correct: 0, exposures: [] as number[], letters: [] as number[], rts: [] as number[] });
  const askedAt = useRef(0);
  const t = useTimers();

  useEffect(() => {
    if (trial >= TRIALS) return;
    const s = stimulusFor(level);
    const set = new Set<string>([s]);
    let guard = 0;
    while (set.size < 4 && guard++ < 40) set.add(variantOf(s));
    while (set.size < 4) set.add(pick(WORDS));
    setStim(s);
    setOpts(shuffle([...set]));
    setPhase("fix");
    const e = exposure.current;
    t.after(() => setPhase("show"), 650);
    t.after(() => setPhase("mask"), 650 + e);
    t.after(() => {
      askedAt.current = performance.now();
      setPhase("ask");
    }, 650 + e + 180);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  function choose(o: string) {
    if (phase !== "ask") return;
    const ok = o === stim;
    const r = res.current;
    r.rts.push(performance.now() - askedAt.current);
    if (ok) {
      r.correct += 1;
      r.exposures.push(exposure.current);
      r.letters.push(stim.replace(/ /g, "").length);
      exposure.current = Math.max(35, exposure.current * 0.86);
      sfx.good(sound);
      setFb("good");
    } else {
      exposure.current = Math.min(900, exposure.current * 1.3);
      sfx.bad(sound);
      setFb("bad");
    }
    t.after(() => setFb(null), 250);
    if (trial + 1 >= TRIALS) finish();
    else setTrial(trial + 1);
  }
  function finish() {
    const r = res.current;
    const acc = r.correct / TRIALS;
    const threshold = r.exposures.length ? avg(r.exposures.slice(-6)) : exposure.current;
    const letters = r.letters.length ? avg(r.letters) : 5;
    const lps = letters / (threshold / 1000); // letters processed per second at threshold
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc >= 0.7 && threshold < startExposure * 0.8 ? 0.9 : acc),
      perf: { attention: r2(lps * Math.max(0.2, acc)), reaction: speedIndex(avg(r.rts), Math.max(0.1, acc)) },
      metrics: { dogru: r.correct, esikMs: Math.round(threshold), harfSn: Math.round(lps) },
      summary: `${r.correct}/${TRIALS} doğru · eşik ${Math.round(threshold)} ms`,
      highlights: [
        { label: "Doğru", value: `${r.correct} / ${TRIALS}` },
        { label: "Algı eşiği", value: ms(threshold) },
        { label: "Algı hızı", value: `${Math.round(lps)} harf/sn` },
      ],
    });
  }
  useKeys((e) => {
    const k = parseInt(e.key, 10);
    if (k >= 1 && k <= 4 && opts[k - 1]) choose(opts[k - 1]);
  });

  return (
    <Stage dark>
      <Hud dark left={<Pill tone="dark">⚡ {Math.round(exposure.current)} ms</Pill>} right={<Pill tone="dark">{Math.min(trial + 1, TRIALS)} / {TRIALS}</Pill>} progress={trial / TRIALS} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <Flash kind={fb} />
        <div className="flex h-40 w-full max-w-3xl items-center justify-center rounded-[28px] border-2 border-white/10 bg-white/5">
          {phase === "fix" && <span className="text-5xl font-light text-carrot">+</span>}
          {phase === "show" && <span className="no-select font-extrabold tracking-wide" style={{ fontSize: "clamp(28px,6vw,56px)" }}>{stim}</span>}
          {phase === "mask" && <span className="font-mono text-4xl tracking-widest text-white/40">{"#".repeat(Math.max(5, stim.length))}</span>}
          {phase === "ask" && <span className="text-lg font-bold text-white/60">Hangisini gördün?</span>}
        </div>
        <div className={`grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 ${phase === "ask" ? "" : "invisible"}`}>
          {opts.map((o, i) => (
            <BigChoice key={o + i} color="white" kbd={String(i + 1)} onClick={() => choose(o)}>
              {o}
            </BigChoice>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Schulte Tablosu
   ============================================================ */
export function Schulte({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const n = level <= 3 ? 3 : level <= 8 ? 4 : 5;
  const [grid, setGrid] = useState<number[]>(() => shuffle(Array.from({ length: n * n }, (_, i) => i + 1)));
  const [next, setNext] = useState(1);
  const [wrong, setWrong] = useState<number | null>(null);
  const stats = useRef({ found: 0, errors: 0, tables: 0, times: [] as number[], last: performance.now() });
  const done = useRef(false);

  function tap(v: number) {
    if (done.current || v < next) return;
    const s = stats.current;
    if (v === next) {
      const now = performance.now();
      s.times.push(now - s.last);
      s.last = now;
      s.found += 1;
      sfx.pop(sound);
      if (next === n * n) {
        s.tables += 1;
        sfx.good(sound);
        setGrid(shuffle(Array.from({ length: n * n }, (_, i) => i + 1)));
        setNext(1);
      } else setNext(next + 1);
    } else {
      s.errors += 1;
      sfx.bad(sound);
      setWrong(v);
      setTimeout(() => setWrong(null), 300);
    }
  }

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const acc = s.found / Math.max(1, s.found + s.errors);
    const cps = s.found / DURATION;
    const gf = 1 + (n - 3) * 0.25;
    const quality = clamp((cps / (0.55 + 0.05 * level)) * acc, 0, 1);
    onFinish({
      score: Math.round(clamp(cps * 70 * acc, 0, 100)),
      nextLevel: nextLevelFrom(level, quality),
      perf: { attention: r2(cps * acc * gf * 100), reaction: speedIndex(avg(s.times), acc) },
      metrics: { bulunan: s.found, hata: s.errors, tablo: s.tables, hucreSn: r2(cps), boyut: `${n}x${n}` },
      summary: `${s.found} sayı · ${s.tables} tablo · ${s.errors} hata`,
      highlights: [
        { label: "Bulunan sayı", value: String(s.found) },
        { label: "Tamamlanan tablo", value: String(s.tables) },
        { label: "Hız", value: `${r2(cps)} sayı/sn` },
        { label: "Doğruluk", value: pct(acc) },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">Sıradaki: <b className="text-base">{next}</b></Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="relative aspect-square w-full max-w-[min(560px,calc(100vh-260px))]">
          <div className="grid h-full w-full gap-2" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {grid.map((v) => (
              <button
                key={v}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  tap(v);
                }}
                className={`no-select flex items-center justify-center rounded-2xl border border-line text-2xl font-extrabold shadow-card transition sm:text-4xl ${
                  v < next ? "bg-brand-soft text-brand-dark/40" : wrong === v ? "shake bg-rose-100 dark:bg-rose-500/25" : "bg-surface hover:bg-cream"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-carrot text-night" />
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Aynı mı, Farklı mı? – word discrimination
   ============================================================ */
export function AyniMi({ level, sound, onFinish }: GameProps) {
  const DURATION = 45;
  const deadline = clamp(3200 - level * 120, 1100, 3200);
  const make = () => {
    const w = level <= 5 ? pick(wordsOfLength(4, 7)) : level <= 11 ? pick(wordsOfLength(6, 11)) : `${pick(wordsOfLength(4, 7))} ${pick(wordsOfLength(4, 7))}`;
    const same = Math.random() < 0.5;
    return { a: w, b: same ? w : w.includes(" ") ? w.split(" ").map((p, i) => (i === 1 ? similarWord(p) : p)).join(" ") : similarWord(w), same };
  };
  const [pair, setPair] = useState(make);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const shownAt = useRef(performance.now());
  const stats = useRef({ n: 0, correct: 0, rts: [] as number[], timeouts: 0 });
  const t = useTimers();
  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const done = useRef(false);

  function nextPair() {
    setPair(make());
    shownAt.current = performance.now();
  }
  useEffect(() => {
    t.clear(timeoutId.current);
    timeoutId.current = t.after(() => {
      if (done.current) return;
      stats.current.n += 1;
      stats.current.timeouts += 1;
      sfx.bad(sound);
      setFb("bad");
      t.after(() => setFb(null), 200);
      nextPair();
    }, deadline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair]);

  function answer(same: boolean) {
    if (done.current) return;
    const s = stats.current;
    s.n += 1;
    const ok = same === pair.same;
    if (ok) {
      s.correct += 1;
      s.rts.push(performance.now() - shownAt.current);
      sfx.good(sound);
    } else sfx.bad(sound);
    setFb(ok ? "good" : "bad");
    t.after(() => setFb(null), 200);
    nextPair();
  }
  useKeys((e) => {
    if (e.key.toLowerCase() === "a") answer(true);
    if (e.key.toLowerCase() === "l") answer(false);
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const acc = s.n ? s.correct / s.n : 0;
    const rt = avg(s.rts);
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc - (rt > deadline * 0.8 ? 0.1 : 0)),
      perf: { attention: Math.max(0.05, acc) * levelFactor(level) * (s.correct / DURATION) * 600, reaction: speedIndex(rt, Math.max(0.1, acc)) },
      metrics: { deneme: s.n, dogru: s.correct, sureAsimi: s.timeouts, ortTepki: Math.round(rt) },
      summary: `${s.correct}/${s.n} doğru · ort. ${Math.round(rt)} ms`,
      highlights: [
        { label: "Doğru", value: `${s.correct} / ${s.n}` },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. tepki", value: rt ? ms(rt) : "–" },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">{stats.current.correct} doğru</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <Flash kind={fb} />
        <div key={pair.a + pair.b} className="grid w-full max-w-3xl grid-cols-2 gap-3" style={{ animation: "pop .25s both" }}>
          {[pair.a, pair.b].map((w, i) => (
            <div key={i} className="flex h-36 items-center justify-center rounded-[26px] border border-line bg-surface px-2 text-center font-extrabold shadow-card" style={{ fontSize: "clamp(20px,4.5vw,40px)" }}>
              {w}
            </div>
          ))}
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <BigChoice color="brand" kbd="A" onClick={() => answer(true)}>AYNI</BigChoice>
          <BigChoice color="carrot" kbd="L" onClick={() => answer(false)}>FARKLI</BigChoice>
        </div>
      </div>
    </Stage>
  );
}

