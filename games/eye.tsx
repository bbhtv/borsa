"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { levelFactor, nextLevelFrom, speedIndex } from "@/lib/engine";
import {
  BigChoice,
  Flash,
  Hud,
  Keypad,
  Pill,
  Stage,
  TimeLeft,
  avg,
  beatMs,
  clamp,
  ms,
  pct,
  pick,
  randInt,
  sfx,
  useCountdown,
  useKeys,
  useLatest,
  useStageSize,
  useTimers,
  type GameProps,
} from "@/components/game/kit";

type Pt = [number, number];

/* ============================================================
   Sıçrayan Tavşan – saccades + vigilance targets
   ============================================================ */
const PATTERNS: { name: string; pts: (i: number) => Pt }[] = [
  { name: "Köşeler", pts: (i) => ([[0.08, 0.1], [0.92, 0.1], [0.92, 0.9], [0.08, 0.9]] as Pt[])[i % 4] },
  { name: "Satır satır", pts: (i) => { const row = Math.floor(i / 2) % 4; return [i % 2 === 0 ? 0.08 : 0.92, 0.14 + row * 0.24]; } },
  { name: "Çapraz", pts: (i) => ([[0.08, 0.1], [0.92, 0.9], [0.92, 0.1], [0.08, 0.9]] as Pt[])[i % 4] },
  { name: "Merkez – dış", pts: (i) => (i % 2 === 0 ? [0.5, 0.5] : ([[0.08, 0.1], [0.92, 0.1], [0.92, 0.9], [0.08, 0.9], [0.5, 0.08], [0.92, 0.5], [0.5, 0.92], [0.08, 0.5]] as Pt[])[(i >> 1) % 8]) },
  { name: "Serbest", pts: () => [0.08 + Math.random() * 0.84, 0.1 + Math.random() * 0.8] },
];

export function SicrayanTavsan({ level, wpm, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const interval = beatMs(wpm, level, 2.2, 380, 1100);
  const [pos, setPos] = useState<Pt>([0.5, 0.5]);
  const [isTarget, setIsTarget] = useState(false);
  const [pat, setPat] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const stats = useRef({ targets: 0, hits: 0, fa: 0, rts: [] as number[] });
  const targetAt = useRef<number | null>(null);
  const step = useRef(0);
  const nextTarget = useRef(randInt(5, 9));
  const t = useTimers();
  const done = useRef(false);

  useEffect(() => {
    const id = t.every(() => {
      step.current += 1;
      const s = step.current;
      const pIdx = Math.floor(s / 14) % PATTERNS.length;
      setPat(pIdx);
      setPos(PATTERNS[pIdx].pts(s));
      const target = s === nextTarget.current;
      if (target) {
        stats.current.targets += 1;
        const stamp = performance.now();
        targetAt.current = stamp;
        nextTarget.current = s + randInt(5, 10);
        t.after(() => {
          if (targetAt.current === stamp) targetAt.current = null; // missed
        }, interval + 300);
      }
      setIsTarget(target);
      sfx.tick(sound, s % 4 === 0);
    }, interval);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = () => {
    if (done.current) return;
    if (targetAt.current != null) {
      stats.current.hits += 1;
      stats.current.rts.push(performance.now() - targetAt.current);
      targetAt.current = null;
      setIsTarget(false);
      sfx.good(sound);
      setFlash("good");
    } else {
      stats.current.fa += 1;
      sfx.bad(sound);
      setFlash("bad");
    }
    t.after(() => setFlash(null), 250);
  };
  useKeys((e) => {
    if (e.code === "Space") {
      e.preventDefault();
      tap();
    }
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const hitRate = s.targets ? s.hits / s.targets : 0;
    const quality = clamp(hitRate - 0.08 * s.fa, 0, 1);
    const rt = avg(s.rts);
    onFinish({
      score: Math.round(quality * 100),
      nextLevel: nextLevelFrom(level, quality),
      perf: { attention: Math.max(0.05, quality) * levelFactor(level) * 100, reaction: rt ? speedIndex(rt, Math.max(0.1, hitRate)) : 0 },
      metrics: { hedef: s.targets, yakalanan: s.hits, yanlisAlarm: s.fa, ortTepki: Math.round(rt), tempoMs: Math.round(interval) },
      summary: `${s.hits}/${s.targets} havuç · ${s.fa} yanlış alarm`,
      highlights: [
        { label: "Yakalanan havuç", value: `${s.hits} / ${s.targets}` },
        { label: "Yanlış alarm", value: String(s.fa) },
        { label: "Ort. tepki", value: rt ? ms(rt) : "–" },
        { label: "Tempo", value: `${Math.round(60000 / interval)} sıçrama/dk` },
      ],
    });
  });

  return (
    <Stage dark>
      <Hud dark left={<Pill tone="dark">🎯 {PATTERNS[pat].name}</Pill>} right={<TimeLeft dark left={left} />} progress={1 - left / DURATION} />
      <div className="flex-1 p-3 sm:p-6" onPointerDown={tap}>
        <div className="grid-bg relative h-full w-full rounded-[28px] border-2 border-white/10">
          <Flash kind={flash} />
          <div
            className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-5xl sm:h-20 sm:w-20 sm:text-6xl"
            style={{ left: `${pos[0] * 100}%`, top: `${pos[1] * 100}%` }}
          >
            <span className={isTarget ? "drop-shadow-[0_0_18px_rgba(255,159,28,.9)]" : ""}>{isTarget ? "🥕" : "🐰"}</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Kelebek Sayacı – pursuit + counting (working memory)
   ============================================================ */
const PAIRS: [string, string, string, string][] = [
  ["🦋", "kelebek", "🐝", "arı"],
  ["🐞", "uğur böceği", "🐜", "karınca"],
  ["🐠", "tropik balık", "🐟", "balık"],
  ["🐥", "civciv", "🐤", "yavru kuş"],
];

export function KelebekSayaci({ level, wpm, sound, onFinish }: GameProps) {
  const duration = level <= 3 ? 30 : level <= 7 ? 40 : 45;
  const pair = useMemo(() => PAIRS[Math.min(PAIRS.length - 1, Math.floor((level - 1) / 3)) % PAIRS.length], [level]);
  const targetFirst = useMemo(() => Math.random() < 0.5, []);
  const target = targetFirst ? pair[0] : pair[2];
  const targetName = targetFirst ? pair[1] : pair[3];
  const other = targetFirst ? pair[2] : pair[0];
  const interval = beatMs(wpm, level, 2.6, 420, 1200);
  const [phase, setPhase] = useState<"brief" | "run" | "answer">("brief");
  const [pos, setPos] = useState<Pt>([0.5, 0.5]);
  const [emoji, setEmoji] = useState<string>(target);
  const [answer, setAnswer] = useState("");
  const count = useRef(0);
  const shown = useRef(0);
  const dir = useRef<Pt>([0.18, 0.13]);
  const posRef = useRef<Pt>([0.5, 0.5]);
  const t = useTimers();
  const startRun = useRef(0);

  useEffect(() => {
    if (phase === "brief") {
      const id = t.after(() => {
        startRun.current = performance.now();
        setPhase("run");
      }, 2600);
      return () => t.clear(id);
    }
    if (phase !== "run") return;
    const id = t.every(() => {
      // drift with direction changes ("bounce")
      {
        const [x, y] = posRef.current;
        let [dx, dy] = dir.current;
        if (Math.random() < 0.25) {
          dx = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.18);
          dy = (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.16);
        }
        let nx = x + dx;
        let ny = y + dy;
        if (nx < 0.1 || nx > 0.9) { dx = -dx; nx = clamp(nx, 0.1, 0.9); }
        if (ny < 0.12 || ny > 0.88) { dy = -dy; ny = clamp(ny, 0.12, 0.88); }
        dir.current = [dx, dy];
        posRef.current = [nx, ny];
        setPos([nx, ny]);
      }
      const isT = Math.random() < 0.45;
      setEmoji(isT ? target : other);
      if (isT) count.current += 1;
      shown.current += 1;
      sfx.tick(sound, isT && level <= 2);
      if (performance.now() - startRun.current > duration * 1000) {
        t.clear(id);
        setPhase("answer");
      }
    }, interval);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function submit() {
    if (!answer) return;
    const a = parseInt(answer, 10);
    const c = count.current;
    const err = Math.abs(a - c);
    const acc = c ? clamp(1 - err / c, 0, 1) : a === 0 ? 1 : 0;
    const speed = 1000 / interval;
    (err === 0 ? sfx.good : sfx.bad)(sound);
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: err === 0 ? Math.min(20, level + 1) : err >= 3 ? Math.max(1, level - 1) : level,
      perf: { attention: Math.max(0.05, acc) * levelFactor(level) * speed * 100, memory: Math.max(0.05, acc) * duration * levelFactor(level) },
      metrics: { gercek: c, cevap: a, hata: err, sure: duration },
      summary: `${c} ${targetName} vardı · sen ${a} dedin`,
      highlights: [
        { label: `Gerçek ${target}`, value: String(c) },
        { label: "Senin cevabın", value: String(a) },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Tempo", value: `${Math.round(60000 / interval)} vuruş/dk` },
      ],
    });
  }

  if (phase === "brief")
    return (
      <Stage dark>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center" style={{ animation: "pop .4s both" }}>
          <div className="text-8xl">{target}</div>
          <div className="text-3xl font-extrabold">Bu turda {targetName} say!</div>
          <div className="text-lg font-semibold text-white/70">{other} göründüğünde sayma. Toplam {duration} saniye.</div>
        </div>
      </Stage>
    );

  if (phase === "answer")
    return (
      <Stage dark>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
          <div className="text-center text-2xl font-extrabold">
            Kaç tane <span className="text-4xl">{target}</span> saydın?
          </div>
          <div className="flex h-16 min-w-40 items-center justify-center rounded-2xl bg-white/10 px-6 text-4xl font-extrabold tabular-nums">
            {answer || <span className="text-white/30">?</span>}
          </div>
          <Keypad dark value={answer} onChange={setAnswer} onSubmit={submit} maxLen={3} />
        </div>
      </Stage>
    );

  return (
    <Stage dark>
      <Hud dark left={<Pill tone="dark">Say: {target}</Pill>} right={<Pill tone="dark">🎵 {Math.round(60000 / interval)} vuruş/dk</Pill>} />
      <div className="flex-1 p-3 sm:p-6">
        <div className="grid-bg relative h-full w-full rounded-[28px] border-2 border-white/10">
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-7xl"
            style={{ left: `${pos[0] * 100}%`, top: `${pos[1] * 100}%`, transition: `left ${interval * 0.55}ms ease-in-out, top ${interval * 0.55}ms ease-in-out` }}
          >
            {emoji}
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Kayan Yıldız – smooth pursuit + flash detection
   ============================================================ */
const PATHS: { name: string; f: (t: number) => Pt }[] = [
  { name: "Sonsuzluk ∞", f: (t) => [0.5 + 0.4 * Math.sin(t), 0.5 + 0.3 * Math.sin(2 * t)] },
  { name: "Daire", f: (t) => [0.5 + 0.36 * Math.cos(t), 0.5 + 0.36 * Math.sin(t)] },
  {
    name: "Satır takibi",
    f: (t) => {
      const lineT = (t / Math.PI) % 5;
      const row = Math.floor(lineT);
      const frac = lineT - row;
      const x = frac < 0.88 ? 0.08 + (frac / 0.88) * 0.84 : 0.92 - ((frac - 0.88) / 0.12) * 0.84;
      return [x, 0.14 + row * 0.18 + (frac >= 0.88 ? ((frac - 0.88) / 0.12) * 0.18 : 0)];
    },
  },
  { name: "Dalga", f: (t) => [0.5 + 0.42 * Math.sin(t * 0.7), 0.5 + 0.3 * Math.sin(t * 2.1)] },
];

export function GozTakibi({ level, wpm, sound, onFinish }: GameProps) {
  const DURATION = 50;
  const [ref, size] = useStageSize<HTMLDivElement>();
  const starRef = useRef<HTMLDivElement>(null);
  const [pathIdx, setPathIdx] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const flashAt = useRef<number | null>(null);
  const stats = useRef({ flashes: 0, hits: 0, fa: 0, rts: [] as number[] });
  const sizeRef = useLatest(size);
  const t = useTimers();
  const speed = clamp(0.9 + wpm / 400 + level * 0.06, 1, 3.2); // rad/sec
  const flashMs = clamp(650 - level * 25, 280, 650);
  const done = useRef(false);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const el = (now - t0) / 1000;
      const pi = Math.floor(el / 12.5) % PATHS.length;
      setPathIdx((p) => (p === pi ? p : pi));
      const [x, y] = PATHS[pi].f(el * speed);
      const s = sizeRef.current;
      if (starRef.current) starRef.current.style.transform = `translate(${x * s.w}px, ${y * s.h}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const schedule = () => {
      t.after(() => {
        if (done.current) return;
        stats.current.flashes += 1;
        flashAt.current = performance.now();
        setFlashing(true);
        t.after(() => {
          setFlashing(false);
          t.after(() => (flashAt.current = null), 250);
        }, flashMs);
        schedule();
      }, randInt(2600, 5200));
    };
    schedule();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = () => {
    if (done.current) return;
    if (flashAt.current != null) {
      stats.current.hits += 1;
      stats.current.rts.push(performance.now() - flashAt.current);
      flashAt.current = null;
      setFlashing(false);
      sfx.good(sound);
      setFb("good");
    } else {
      stats.current.fa += 1;
      sfx.bad(sound);
      setFb("bad");
    }
    t.after(() => setFb(null), 250);
  };
  useKeys((e) => {
    if (e.code === "Space") {
      e.preventDefault();
      tap();
    }
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const hr = s.flashes ? s.hits / s.flashes : 0;
    const q = clamp(hr - 0.1 * s.fa, 0, 1);
    const rt = avg(s.rts);
    onFinish({
      score: Math.round(q * 100),
      nextLevel: nextLevelFrom(level, q),
      perf: { attention: Math.max(0.05, q) * levelFactor(level) * 100, reaction: rt ? speedIndex(rt, Math.max(0.1, hr)) : 0 },
      metrics: { parlama: s.flashes, yakalanan: s.hits, yanlisAlarm: s.fa, ortTepki: Math.round(rt) },
      summary: `${s.hits}/${s.flashes} parlama yakalandı`,
      highlights: [
        { label: "Yakalanan", value: `${s.hits} / ${s.flashes}` },
        { label: "Yanlış alarm", value: String(s.fa) },
        { label: "Ort. tepki", value: rt ? ms(rt) : "–" },
      ],
    });
  });

  return (
    <Stage dark>
      <Hud dark left={<Pill tone="dark">〰️ {PATHS[pathIdx].name}</Pill>} right={<TimeLeft dark left={left} />} progress={1 - left / DURATION} />
      <div className="flex-1 p-3 sm:p-6" onPointerDown={tap}>
        <div ref={ref} className="grid-bg relative h-full w-full rounded-[28px] border-2 border-white/10">
          <Flash kind={fb} />
          <div ref={starRef} className="absolute left-0 top-0 text-5xl will-change-transform sm:text-6xl">
            <span className={flashing ? "drop-shadow-[0_0_24px_rgba(255,255,255,1)]" : "drop-shadow-[0_0_12px_rgba(255,201,77,.7)]"}>{flashing ? "💥" : "⭐"}</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Genişleyen Çerçeve – visual span with peripheral probes
   ============================================================ */
const LETTER_PAIRS = ["EF", "OQ", "PR", "CG", "MN", "BD", "ÜU", "ŞS", "İI", "ÖO", "KX", "VY"];

export function GenisleyenCerceve({ level, wpm, sound, onFinish }: GameProps) {
  const PROBES = 14;
  const [ref, size] = useStageSize<HTMLDivElement>();
  const stepMs = beatMs(wpm, level, 3, 450, 900);
  const exposure = clamp(420 - level * 18, 110, 420);
  const [scale, setScale] = useState(0.2);
  const [ghosts, setGhosts] = useState<number[]>([]);
  const [probe, setProbe] = useState<{ l: string; r: string; show: boolean; same: boolean } | null>(null);
  const [awaiting, setAwaiting] = useState(false);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const width = useRef(0.4); // staircase on probe width
  const res = useRef({ n: 0, correct: 0, widths: [] as number[], rts: [] as number[] });
  const dirRef = useRef(1);
  const scaleRef = useRef(0.2);
  const stepN = useRef(0);
  const askedAt = useRef(0);
  const t = useTimers();
  const finished = useRef(false);

  const aspect = size.h > 0 ? size.w / size.h : 1.6;

  useEffect(() => {
    if (awaiting) return;
    const id = t.every(() => {
      stepN.current += 1;
      {
        const s = scaleRef.current;
        let ns = s + dirRef.current * 0.11;
        if (ns >= 0.95) { ns = 0.95; dirRef.current = -1; }
        if (ns <= 0.18) { ns = 0.18; dirRef.current = 1; }
        scaleRef.current = ns;
        setGhosts((g) => [s, ...g].slice(0, 3));
        setScale(ns);
      }
      sfx.tick(sound);
      if (stepN.current % 3 === 0 && res.current.n < PROBES) {
        t.clear(id);
        const pairStr = pick(LETTER_PAIRS.slice(0, Math.min(LETTER_PAIRS.length, 4 + Math.floor(level / 2))));
        const same = Math.random() < 0.5;
        const a = pairStr[Math.random() < 0.5 ? 0 : 1];
        const b = same ? a : pairStr.replace(a, "") || pairStr[1];
        scaleRef.current = width.current;
        setScale(width.current);
        setProbe({ l: a, r: b, show: true, same });
        t.after(() => {
          setProbe((p) => (p ? { ...p, show: false } : p));
          askedAt.current = performance.now();
          setAwaiting(true);
        }, exposure);
      }
    }, stepMs);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaiting]);

  function answer(saidSame: boolean) {
    if (!probe || !awaiting) return;
    const ok = saidSame === probe.same;
    const r = res.current;
    r.n += 1;
    r.rts.push(performance.now() - askedAt.current);
    if (ok) {
      r.correct += 1;
      r.widths.push(width.current);
      width.current = clamp(width.current + 0.08, 0.25, 0.95);
      sfx.good(sound);
      setFb("good");
    } else {
      width.current = clamp(width.current - 0.1, 0.25, 0.95);
      sfx.bad(sound);
      setFb("bad");
    }
    t.after(() => setFb(null), 250);
    setProbe(null);
    if (r.n >= PROBES) {
      finish();
      return;
    }
    setAwaiting(false);
  }
  function finish() {
    if (finished.current) return;
    finished.current = true;
    const r = res.current;
    const acc = r.n ? r.correct / r.n : 0;
    const span = r.widths.length ? avg(r.widths) : 0.25;
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc),
      perf: { attention: Math.max(0.05, acc) * (0.5 + span) * levelFactor(level) * 100 },
      metrics: { dogru: r.correct, deneme: r.n, ortGenislik: Math.round(span * 100), gosterim: Math.round(exposure) },
      summary: `${r.correct}/${r.n} doğru · görüş genişliği %${Math.round(span * 100)}`,
      highlights: [
        { label: "Doğru", value: `${r.correct} / ${r.n}` },
        { label: "Görüş genişliği", value: `%${Math.round(span * 100)}` },
        { label: "Gösterim süresi", value: ms(exposure) },
      ],
    });
  }
  useKeys((e) => {
    if (!awaiting) return;
    if (e.key.toLowerCase() === "a") answer(true);
    if (e.key.toLowerCase() === "l") answer(false);
  });

  const rect = (s: number) => {
    const W = size.w * s;
    const H = Math.min(size.h * s, W / aspect);
    return { width: W, height: H };
  };

  return (
    <Stage className="!bg-black text-white">
      <Hud dark left={<Pill tone="dark">👁 Merkeze bak</Pill>} right={<Pill tone="dark">{res.current.n} / {PROBES}</Pill>} progress={res.current.n / PROBES} />
      <div ref={ref} className="relative m-3 flex-1 sm:m-6">
        <Flash kind={fb} />
        {ghosts.map((g, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border-2"
            style={{ ...rect(g), borderColor: `rgba(25,227,249,${0.25 - i * 0.07})` }}
          />
        ))}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border-[3px] border-logo transition-all duration-200"
          style={rect(scale)}
        >
          {probe?.show && (
            <>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-3xl font-extrabold sm:text-4xl">{probe.l}</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl font-extrabold sm:text-4xl">{probe.r}</span>
            </>
          )}
        </div>
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-carrot shadow-[0_0_14px_#FF9F1C]" />
      </div>
      {awaiting && (
        <div className="grid grid-cols-2 gap-3 px-4 pb-5 sm:mx-auto sm:w-[520px]" style={{ animation: "fadeUp .25s both" }}>
          <BigChoice color="brand" kbd="A" onClick={() => answer(true)}>AYNI</BigChoice>
          <BigChoice color="carrot" kbd="L" onClick={() => answer(false)}>FARKLI</BigChoice>
        </div>
      )}
    </Stage>
  );
}
