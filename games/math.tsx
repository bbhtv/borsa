"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { levelFactor, nextLevelFrom, speedIndex } from "@/lib/engine";
import {
  Flash,
  Hud,
  Keypad,
  Pill,
  Stage,
  TimeLeft,
  avg,
  clamp,
  ms,
  pct,
  pick,
  r2,
  randInt,
  sfx,
  shuffle,
  useCountdown,
  useKeys,
  useTimers,
  type GameProps,
} from "@/components/game/kit";

/* ============================================================
   Roket Sıralama – order boxes from largest to smallest
   ============================================================ */
interface Box {
  id: number;
  label: string;
  value: number;
  x: number;
  y: number;
}
function makeBoxes(level: number, round: number): Box[] {
  const count = clamp(3 + Math.floor((level - 1) / 2) + Math.floor(round / 3), 3, 8);
  const used = new Set<number>();
  const out: Box[] = [];
  // place boxes on a jittered grid so they never overlap
  const cols = 4;
  const slots = shuffle(Array.from({ length: 12 }, (_, i) => i)).slice(0, count);
  for (let i = 0; i < count; i++) {
    let value = 0;
    let label = "";
    let guard = 0;
    do {
      if (level <= 4) {
        value = randInt(1, 9);
        label = String(value);
      } else if (level <= 8) {
        value = randInt(10, 99);
        label = String(value);
      } else if (level <= 13) {
        const a = randInt(5, 18);
        const b = randInt(1, Math.min(9, a - 1));
        if (Math.random() < 0.5) {
          value = a + b;
          label = `${a}+${b}`;
        } else {
          value = a - b;
          label = `${a}−${b}`;
        }
      } else {
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        if (Math.random() < 0.5) {
          value = a * b;
          label = `${a}×${b}`;
        } else {
          const c = randInt(1, Math.min(20, a * b - 1));
          value = a * b - c;
          label = `${a}×${b}−${c}`;
        }
      }
    } while (used.has(value) && guard++ < 30);
    used.add(value);
    const s = slots[i];
    out.push({ id: i, label, value, x: (s % cols) / cols + 0.03 + Math.random() * 0.08, y: Math.floor(s / cols) / 3 + 0.04 + Math.random() * 0.12 });
  }
  return out;
}

export function RoketSiralama({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const [round, setRound] = useState(0);
  const boxes = useMemo(() => makeBoxes(level, round), [level, round]);
  const order = useMemo(() => [...boxes].sort((a, b) => b.value - a.value), [boxes]);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [rocket, setRocket] = useState(0);
  const stats = useRef({ items: 0, errors: 0, rounds: 0, times: [] as number[], last: performance.now() });
  const over = useRef(false);

  function tap(b: Box) {
    if (over.current || done.includes(b.id)) return;
    const s = stats.current;
    const expected = order[done.length];
    if (b.value === expected.value) {
      const now = performance.now();
      s.times.push(now - s.last);
      s.last = now;
      s.items += 1;
      sfx.pop(sound);
      const nd = [...done, b.id];
      if (nd.length === boxes.length) {
        s.rounds += 1;
        sfx.good(sound);
        setRocket((r) => r + 1);
        setTimeout(() => {
          setDone([]);
          setRound((r) => r + 1);
        }, 280);
      }
      setDone(nd);
    } else {
      s.errors += 1;
      sfx.bad(sound);
      setWrong(b.id);
      setTimeout(() => setWrong(null), 320);
    }
  }

  const left = useCountdown(DURATION, true, () => {
    over.current = true;
    const s = stats.current;
    const acc = s.items / Math.max(1, s.items + s.errors);
    const perMin = s.items;
    onFinish({
      score: Math.round(clamp((perMin / (24 + level * 2)) * acc, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, clamp((perMin / (20 + level * 2)) * acc, 0, 1)),
      perf: { math: r2(perMin * acc * levelFactor(level)), attention: r2(acc * levelFactor(level) * 100), reaction: speedIndex(avg(s.times), Math.max(0.1, acc)) },
      metrics: { kutu: s.items, hata: s.errors, tur: s.rounds },
      summary: `${s.rounds} tur · ${s.items} kutu · ${s.errors} hata`,
      highlights: [
        { label: "Tamamlanan tur", value: String(s.rounds) },
        { label: "Sıralanan kutu", value: String(s.items) },
        { label: "Doğruluk", value: pct(acc) },
      ],
    });
  });

  return (
    <Stage dark>
      <Hud dark left={<Pill tone="dark">Büyükten küçüğe ↓</Pill>} right={<TimeLeft dark left={left} />} progress={1 - left / DURATION} />
      <div className="flex flex-1 gap-3 p-3 sm:p-6">
        <div className="relative flex-1 rounded-[28px] border-2 border-white/10 bg-white/5">
          {boxes.map((b) => {
            const idx = done.indexOf(b.id);
            return (
              <button
                key={`${round}-${b.id}`}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  tap(b);
                }}
                className={`no-select absolute flex h-[22%] w-[21%] min-w-[64px] items-center justify-center rounded-2xl border-b-[6px] font-extrabold transition ${
                  idx >= 0
                    ? "border-brand-dark bg-brand text-white opacity-60"
                    : wrong === b.id
                      ? "shake border-rose-700 bg-rose-500 text-white"
                      : "border-[#CBD5D1] bg-white text-ink hover:-translate-y-0.5"
                }`}
                style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, fontSize: b.label.length > 4 ? "clamp(16px,3.4vw,30px)" : "clamp(22px,5vw,44px)", animation: "pop .25s both" }}
              >
                {b.label}
                {idx >= 0 && <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-carrot text-xs text-ink">{idx + 1}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative w-14 rounded-full bg-white/5 sm:w-20">
          <div className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-carrot/60 to-transparent transition-all duration-500" style={{ height: `${Math.min(100, rocket * 10)}%` }} />
          <span className="absolute left-1/2 -translate-x-1/2 text-4xl transition-all duration-500 sm:text-5xl" style={{ bottom: `calc(${Math.min(88, rocket * 10)}% )` }}>
            🚀
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Zihinden Hesap – adaptive arithmetic sprint
   ============================================================ */
function problem(d: number): { q: string; a: number } {
  switch (clamp(d, 1, 10)) {
    case 1: { const a = randInt(1, 9), b = randInt(1, 9); return { q: `${a} + ${b}`, a: a + b }; }
    case 2: { const a = randInt(6, 15), b = randInt(2, 9); return Math.random() < 0.5 ? { q: `${a} + ${b}`, a: a + b } : { q: `${a} − ${b}`, a: a - b }; }
    case 3: { const a = randInt(12, 60), b = randInt(3, 9); return Math.random() < 0.5 ? { q: `${a} + ${b}`, a: a + b } : { q: `${a} − ${b}`, a: a - b }; }
    case 4: { const a = randInt(15, 80), b = randInt(11, 40); return Math.random() < 0.5 ? { q: `${a} + ${b}`, a: a + b } : { q: `${Math.max(a, b)} − ${Math.min(a, b)}`, a: Math.abs(a - b) }; }
    case 5: { const a = randInt(2, 5), b = randInt(2, 9); return { q: `${a} × ${b}`, a: a * b }; }
    case 6: { const a = randInt(3, 9), b = randInt(3, 9); return { q: `${a} × ${b}`, a: a * b }; }
    case 7: { const b = randInt(2, 9), a = b * randInt(2, 9); return { q: `${a} ÷ ${b}`, a: a / b }; }
    case 8: { const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 20); return { q: `${a} × ${b} + ${c}`, a: a * b + c }; }
    case 9: { const a = randInt(12, 39), b = randInt(2, 6); return { q: `${a} × ${b}`, a: a * b }; }
    default: { const p = pick([10, 20, 25, 50]), base = pick([40, 60, 80, 120, 200, 240]); return { q: `${base} sayısının %${p}'i`, a: (base * p) / 100 }; }
  }
}

export function ZihindenHesap({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const [d, setD] = useState(clamp(Math.ceil(level / 2), 1, 10));
  const [p, setP] = useState(() => problem(clamp(Math.ceil(level / 2), 1, 10)));
  const [answer, setAnswer] = useState("");
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const streak = useRef(0);
  const stats = useRef({ correct: 0, wrong: 0, diffSum: 0, times: [] as number[], shown: performance.now() });
  const over = useRef(false);

  function next(nd: number) {
    setP(problem(nd));
    setAnswer("");
    stats.current.shown = performance.now();
  }
  function check(v: string) {
    if (over.current) return;
    const s = stats.current;
    const target = String(p.a);
    if (v === target) {
      s.correct += 1;
      s.diffSum += d;
      s.times.push(performance.now() - s.shown);
      sfx.good(sound);
      setFb("good");
      setTimeout(() => setFb(null), 180);
      streak.current += 1;
      let nd = d;
      if (streak.current >= 3) {
        nd = Math.min(10, d + 1);
        streak.current = 0;
      }
      setD(nd);
      next(nd);
    } else if (v.replace("-", "").length >= target.replace("-", "").length) {
      s.wrong += 1;
      streak.current = 0;
      sfx.bad(sound);
      setFb("bad");
      setTimeout(() => setFb(null), 250);
      const nd = Math.max(1, d - 1);
      setD(nd);
      next(nd);
    }
  }
  function onChange(v: string) {
    setAnswer(v);
    check(v);
  }

  const left = useCountdown(DURATION, true, () => {
    over.current = true;
    const s = stats.current;
    const acc = s.correct / Math.max(1, s.correct + s.wrong);
    const avgD = s.correct ? s.diffSum / s.correct : d;
    const weight = 1 + (avgD - 1) * 0.35;
    onFinish({
      score: Math.round(clamp((s.correct * weight) / 30, 0, 1) * 100),
      nextLevel: clamp(Math.round(avgD * 2) - (acc < 0.6 ? 1 : 0), 1, 20),
      perf: { math: r2(s.correct * acc * weight) },
      metrics: { dogru: s.correct, yanlis: s.wrong, ortZorluk: r2(avgD), ortSure: Math.round(avg(s.times)) },
      summary: `${s.correct} doğru işlem · zorluk ${r2(avgD)}`,
      highlights: [
        { label: "Doğru işlem", value: String(s.correct) },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. süre", value: ms(avg(s.times)) },
        { label: "Ulaşılan zorluk", value: `${Math.round(avgD)} / 10` },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">Zorluk {d}/10 · {stats.current.correct} doğru</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 p-4">
        <Flash kind={fb} />
        <div key={p.q} className="text-center font-extrabold text-ink" style={{ fontSize: "clamp(36px,8vw,72px)", animation: "pop .2s both" }}>
          {p.q} = <span className="text-brand">{answer || "?"}</span>
        </div>
        <Keypad value={answer} onChange={onChange} onSubmit={() => answer && check(answer + " ")} maxLen={5} />
      </div>
    </Stage>
  );
}

/* ============================================================
   Sayı Zinciri – running total in working memory
   ============================================================ */
export function SayiZinciri({ level, sound, onFinish }: GameProps) {
  const ROUNDS = 5;
  const steps = clamp(3 + Math.floor(level / 3), 3, 9);
  const stepMs = clamp(1900 - level * 60, 900, 1900);
  const [round, setRound] = useState(0);
  const [chain, setChain] = useState<{ start: number; ops: string[]; result: number }>({ start: 0, ops: [], result: 0 });
  const [shown, setShown] = useState<string | null>(null);
  const [phase, setPhase] = useState<"watch" | "input" | "fb">("watch");
  const [answer, setAnswer] = useState("");
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const res = useRef({ correct: 0, nearMiss: 0 });
  const t = useTimers();

  useEffect(() => {
    let v = randInt(2, level >= 8 ? 20 : 9);
    const start = v;
    const ops: string[] = [];
    for (let i = 0; i < steps; i++) {
      const kinds = level >= 6 ? ["+", "−", "×"] : ["+", "−"];
      let k = pick(kinds);
      if (k === "×" && v > 30) k = "+";
      let n = k === "×" ? randInt(2, 3) : randInt(1, level >= 10 ? 15 : 9);
      if (k === "−") {
        if (v <= 1) k = "+";
        else n = Math.min(n, v - 1);
      }
      v = k === "+" ? v + n : k === "−" ? v - n : v * n;
      ops.push(`${k}${n}`);
    }
    const check = v;
    setChain({ start, ops, result: check });
    setAnswer("");
    setPhase("watch");
    setShown(String(start));
    sfx.tick(sound, true);
    ops.forEach((o, i) => {
      t.after(() => {
        setShown(o.replace("+", "+ ").replace("−", "− ").replace("×", "× "));
        sfx.tick(sound);
      }, (i + 1) * stepMs);
    });
    t.after(() => {
      setShown(null);
      setPhase("input");
    }, (ops.length + 1) * stepMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  function submit() {
    if (phase !== "input" || !answer) return;
    const v = parseInt(answer, 10);
    const ok = v === chain.result;
    if (ok) res.current.correct += 1;
    else if (Math.abs(v - chain.result) <= 2) res.current.nearMiss += 1;
    (ok ? sfx.good : sfx.bad)(sound);
    setFb(ok ? "good" : "bad");
    setPhase("fb");
    t.after(() => setFb(null), 300);
    t.after(() => {
      if (round + 1 >= ROUNDS) finish();
      else setRound(round + 1);
    }, 1300);
  }
  function finish() {
    const r = res.current;
    const acc = r.correct / ROUNDS;
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc),
      perf: { math: r2((r.correct + r.nearMiss * 0.3) * steps * levelFactor(level)), memory: r2((r.correct + 0.2) * steps) },
      metrics: { dogru: r.correct, yakin: r.nearMiss, adim: steps, adimMs: Math.round(stepMs) },
      summary: `${r.correct}/${ROUNDS} zincir doğru · ${steps} adım`,
      highlights: [
        { label: "Doğru zincir", value: `${r.correct} / ${ROUNDS}` },
        { label: "Zincir uzunluğu", value: `${steps} adım` },
        { label: "Adım süresi", value: ms(stepMs) },
      ],
    });
  }

  return (
    <Stage>
      <Hud left={<Pill tone="brand">{phase === "watch" ? "Zihninde hesapla" : "Sonuç kaç?"}</Pill>} right={<Pill>Zincir {round + 1} / {ROUNDS}</Pill>} progress={round / ROUNDS} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 p-4">
        <Flash kind={fb} />
        {phase === "watch" ? (
          <div className="flex h-48 w-64 items-center justify-center rounded-[32px] border border-line bg-white text-7xl font-extrabold shadow-card">
            {shown && <span key={shown + Math.random()} style={{ animation: "pop .18s both" }}>{shown}</span>}
          </div>
        ) : (
          <>
            <div className="flex min-h-16 min-w-40 items-center justify-center rounded-2xl border border-line bg-white px-6 text-4xl font-extrabold tabular-nums shadow-card">
              {phase === "fb" ? (
                <span>
                  {answer} {parseInt(answer, 10) === chain.result ? "✓" : <span className="text-rose-500">→ {chain.result}</span>}
                </span>
              ) : (
                answer || <span className="text-line">?</span>
              )}
            </div>
            <Keypad value={answer} onChange={setAnswer} onSubmit={submit} maxLen={5} />
          </>
        )}
      </div>
    </Stage>
  );
}

/* ============================================================
   Hangisi Büyük? – fast magnitude comparison
   ============================================================ */
interface Side {
  label: React.ReactNode;
  v: number;
}
function frac(a: number, b: number): Side {
  return {
    label: (
      <span className="inline-flex flex-col items-center leading-none">
        <span>{a}</span>
        <span className="my-1 h-1 w-12 rounded bg-ink" />
        <span>{b}</span>
      </span>
    ),
    v: a / b,
  };
}
function cmpPair(level: number): [Side, Side] {
  for (let g = 0; g < 50; g++) {
    let A: Side, B: Side;
    if (level <= 3) {
      const a = randInt(10, 99);
      const b = clamp(a + pick([-7, -5, -3, -1, 1, 3, 5, 7]), 10, 99);
      A = { label: a, v: a };
      B = { label: b, v: b };
    } else if (level <= 7) {
      const a = randInt(3, 20), b = randInt(3, 20), c = randInt(3, 20), d = randInt(3, 20);
      A = { label: `${a}+${b}`, v: a + b };
      B = { label: `${c}+${d}`, v: c + d };
    } else if (level <= 12) {
      const a = randInt(1, 7), b = randInt(a + 1, 9), c = randInt(1, 7), d = randInt(c + 1, 9);
      A = frac(a, b);
      B = frac(c, d);
    } else {
      const a = randInt(3, 9), b = randInt(3, 9), c = randInt(10, 90);
      A = { label: `${a}×${b}`, v: a * b };
      B = { label: `${c}`, v: c };
    }
    if (A.v !== B.v) return Math.random() < 0.5 ? [A, B] : [B, A];
  }
  return [{ label: 1, v: 1 }, { label: 2, v: 2 }];
}

export function HangisiBuyuk({ level, sound, onFinish }: GameProps) {
  const DURATION = 45;
  const [pair, setPair] = useState(() => cmpPair(level));
  const [k, setK] = useState(0);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const shownAt = useRef(performance.now());
  const stats = useRef({ n: 0, correct: 0, rts: [] as number[] });
  const over = useRef(false);

  function answer(side: 0 | 1) {
    if (over.current) return;
    const s = stats.current;
    const ok = pair[side].v > pair[1 - side].v;
    s.n += 1;
    if (ok) {
      s.correct += 1;
      s.rts.push(performance.now() - shownAt.current);
      sfx.pop(sound);
    } else sfx.bad(sound);
    setFb(ok ? "good" : "bad");
    setTimeout(() => setFb(null), 180);
    setPair(cmpPair(level));
    setK((x) => x + 1);
    shownAt.current = performance.now();
  }
  useKeys((e) => {
    if (e.key === "ArrowLeft") answer(0);
    if (e.key === "ArrowRight") answer(1);
  });

  const left = useCountdown(DURATION, true, () => {
    over.current = true;
    const s = stats.current;
    const acc = s.n ? s.correct / s.n : 0;
    const rt = avg(s.rts);
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc - (rt > 2500 ? 0.1 : 0)),
      perf: { math: speedIndex(rt, Math.max(0.1, acc)) * levelFactor(level), reaction: speedIndex(rt, Math.max(0.1, acc)) },
      metrics: { deneme: s.n, dogru: s.correct, ortTepki: Math.round(rt) },
      summary: `${s.correct}/${s.n} doğru · ort. ${Math.round(rt)} ms`,
      highlights: [
        { label: "Doğru", value: `${s.correct} / ${s.n}` },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. süre", value: rt ? ms(rt) : "–" },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">Büyük olana dokun</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 items-center justify-center p-4">
        <Flash kind={fb} />
        <div key={k} className="grid w-full max-w-3xl grid-cols-2 gap-4" style={{ animation: "pop .2s both" }}>
          {pair.map((sd, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                answer(i as 0 | 1);
              }}
              className="btn-3d no-select flex h-52 items-center justify-center rounded-[28px] border border-line bg-white font-extrabold text-ink shadow-[0_8px_0_#CBD5D1] active:translate-y-1 active:shadow-none sm:h-64"
              style={{ fontSize: "clamp(34px,7vw,64px)" }}
            >
              {sd.label}
            </button>
          ))}
        </div>
      </div>
    </Stage>
  );
}
