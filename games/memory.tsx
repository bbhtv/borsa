"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { levelFactor, nextLevelFrom } from "@/lib/engine";
import { NBACK_LETTERS, WORDS } from "@/content/words";
import {
  BigChoice,
  Flash,
  Hud,
  Keypad,
  Pill,
  Stage,
  avg,
  clamp,
  pct,
  pick,
  r2,
  randInt,
  sfx,
  shuffle,
  useKeys,
  useTimers,
  type GameProps,
} from "@/components/game/kit";

/* ============================================================
   Dönen Kare – remember painted cells, then rotate
   ============================================================ */
function rotateIdx(idx: number, n: number, quarter: number) {
  let r = Math.floor(idx / n);
  let c = idx % n;
  for (let q = 0; q < quarter; q++) {
    const nr = c;
    const nc = n - 1 - r;
    r = nr;
    c = nc;
  }
  return r * n + c;
}

export function DonenKare({ level, sound, onFinish }: GameProps) {
  const ROUNDS = 6;
  const [diff, setDiff] = useState(level);
  const n = diff <= 4 ? 3 : diff <= 10 ? 4 : 5;
  const k = n === 3 ? 3 + Math.floor((diff - 1) / 2) : n === 4 ? 4 + Math.floor((diff - 5) / 2) : 6 + Math.floor((diff - 11) / 2);
  const showMs = clamp(2400 - diff * 70, 1000, 2400);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"show" | "hide" | "rotate" | "answer" | "feedback">("show");
  const [cells, setCells] = useState<number[]>([]);
  const [quarter, setQuarter] = useState(1);
  const [sel, setSel] = useState<number[]>([]);
  const [angle, setAngle] = useState(0);
  const res = useRef({ correctCells: 0, totalCells: 0, perfect: 0, maxK: 0 });
  const fails = useRef(0);
  const t = useTimers();

  useEffect(() => {
    const kk = Math.min(k, n * n - 2);
    const c = shuffle(Array.from({ length: n * n }, (_, i) => i)).slice(0, kk);
    const q = diff <= 2 ? 1 : randInt(1, 3);
    setCells(c);
    setQuarter(q);
    setSel([]);
    setAngle(0);
    setPhase("show");
    t.after(() => setPhase("hide"), showMs);
    t.after(() => {
      setPhase("rotate");
      setAngle(q * 90);
    }, showMs + 450);
    t.after(() => {
      setAngle(0);
      setPhase("answer");
    }, showMs + 450 + 1100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const target = useMemo(() => cells.map((c) => rotateIdx(c, n, quarter)), [cells, n, quarter]);

  function toggle(i: number) {
    if (phase !== "answer") return;
    sfx.pop(sound);
    setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length < target.length ? [...s, i] : s));
  }
  function confirm() {
    if (phase !== "answer") return;
    const hit = sel.filter((s) => target.includes(s)).length;
    const r = res.current;
    r.correctCells += hit;
    r.totalCells += target.length;
    const perfect = hit === target.length;
    if (perfect) {
      r.perfect += 1;
      r.maxK = Math.max(r.maxK, target.length);
      fails.current = 0;
      sfx.good(sound);
      setDiff((d) => Math.min(20, d + 1));
    } else {
      fails.current += 1;
      sfx.bad(sound);
      if (fails.current >= 2) {
        setDiff((d) => Math.max(1, d - 1));
        fails.current = 0;
      }
    }
    setPhase("feedback");
    t.after(() => {
      if (round + 1 >= ROUNDS) finish();
      else setRound(round + 1);
    }, 1300);
  }
  function finish() {
    const r = res.current;
    const acc = r.totalCells ? r.correctCells / r.totalCells : 0;
    const avgK = r.totalCells / ROUNDS;
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, r.perfect / ROUNDS + 0.15),
      perf: { memory: r2(acc * avgK * levelFactor(level) * 10), attention: r2(acc * levelFactor(level) * 100) },
      metrics: { dogruKare: r.correctCells, toplamKare: r.totalCells, kusursuzTur: r.perfect, enBuyuk: r.maxK },
      summary: `${r.perfect}/${ROUNDS} kusursuz tur · %${Math.round(acc * 100)} doğru kare`,
      highlights: [
        { label: "Kusursuz tur", value: `${r.perfect} / ${ROUNDS}` },
        { label: "Doğru kare", value: pct(acc) },
        { label: "En çok hatırlanan", value: `${r.maxK} kare` },
      ],
    });
  }
  useKeys((e) => {
    if (e.key === "Enter") confirm();
  });

  const showPaint = phase === "show";
  const label =
    phase === "show" ? "Boyalı kareleri aklında tut" : phase === "hide" || phase === "rotate" ? `Dönüyor… ${quarter * 90}°` : phase === "answer" ? `Döndükten sonraki ${target.length} kareyi işaretle` : "Doğru yerler";
  return (
    <Stage>
      <Hud left={<Pill tone="brand">{label}</Pill>} right={<Pill>Tur {round + 1} / {ROUNDS}</Pill>} progress={round / ROUNDS} />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <div className="relative" style={{ perspective: 900 }}>
          <div
            className="relative grid aspect-square w-[min(78vw,calc(100vh-300px),440px)] gap-2 rounded-[26px] bg-deep p-3 shadow-lift"
            style={{
              gridTemplateColumns: `repeat(${n}, 1fr)`,
              transform: `rotate(${angle}deg)`,
              transition: phase === "rotate" ? "transform 1s cubic-bezier(.6,.05,.3,1)" : "none",
            }}
          >
            {(() => {
              const q = phase === "answer" || phase === "feedback" ? quarter : 0;
              const pos = ["-left-3 -top-3", "-right-3 -top-3", "-right-3 -bottom-3", "-left-3 -bottom-3"][q];
              return <span className={`absolute z-10 text-2xl ${pos}`}>🐰</span>;
            })()}
            {Array.from({ length: n * n }, (_, i) => {
              const painted = showPaint && cells.includes(i);
              const picked = sel.includes(i);
              const isT = target.includes(i);
              let bg = "bg-white/10";
              if (painted) bg = "bg-carrot";
              else if (phase === "answer" && picked) bg = "bg-brand";
              else if (phase === "feedback") bg = isT && picked ? "bg-emerald-500" : isT ? "bg-carrot/70" : picked ? "bg-rose-500" : "bg-white/10";
              return (
                <button
                  key={i}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    toggle(i);
                  }}
                  className={`no-select rounded-xl transition-colors ${bg}`}
                />
              );
            })}
          </div>
        </div>
        <div className="h-16 w-full max-w-xs">
          {phase === "answer" && (
            <BigChoice className="w-full" disabled={sel.length !== target.length} onClick={confirm}>
              Onayla ({sel.length}/{target.length})
            </BigChoice>
          )}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Işık Yolu – Corsi block tapping
   ============================================================ */
export function IsikYolu({ level, sound, onFinish }: GameProps) {
  const backward = level >= 9;
  const n = level <= 5 ? 3 : 4;
  const startSpan = clamp(3 + Math.floor((level - 1) / 3) - (backward ? 1 : 0), 3, 8);
  const [span, setSpan] = useState(startSpan);
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<"watch" | "input" | "fb">("watch");
  const [input, setInput] = useState<number[]>([]);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const [trial, setTrial] = useState(0);
  const res = useRef({ maxSpan: 0, correct: 0, trials: 0 });
  const wrongStreak = useRef(0);
  const t = useTimers();
  const startedAt = useRef(performance.now());
  const onMs = clamp(700 - level * 15, 420, 700);

  useEffect(() => {
    const s: number[] = [];
    while (s.length < span) {
      const v = randInt(0, n * n - 1);
      if (s[s.length - 1] !== v) s.push(v);
    }
    setSeq(s);
    setInput([]);
    setPhase("watch");
    s.forEach((v, i) => {
      t.after(() => {
        setLit(v);
        sfx.tick(sound, i === 0);
      }, 600 + i * (onMs + 250));
      t.after(() => setLit(null), 600 + i * (onMs + 250) + onMs);
    });
    t.after(() => setPhase("input"), 600 + s.length * (onMs + 250));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  function tap(i: number) {
    if (phase !== "input") return;
    const expected = backward ? [...seq].reverse() : seq;
    const nextInput = [...input, i];
    setLit(i);
    t.after(() => setLit(null), 160);
    const pos = nextInput.length - 1;
    const r = res.current;
    if (expected[pos] !== i) {
      r.trials += 1;
      wrongStreak.current += 1;
      sfx.bad(sound);
      setFb("bad");
      setPhase("fb");
      t.after(() => setFb(null), 300);
      if (wrongStreak.current >= 2 || performance.now() - startedAt.current > 80000) return void t.after(finish, 700);
      t.after(() => setTrial((x) => x + 1), 900);
      return;
    }
    sfx.pop(sound);
    setInput(nextInput);
    if (nextInput.length === expected.length) {
      r.trials += 1;
      r.correct += 1;
      r.maxSpan = Math.max(r.maxSpan, span);
      wrongStreak.current = 0;
      sfx.good(sound);
      setFb("good");
      setPhase("fb");
      t.after(() => setFb(null), 300);
      if (performance.now() - startedAt.current > 80000 || span >= 10) return void t.after(finish, 700);
      setSpan((s) => s + 1);
      t.after(() => setTrial((x) => x + 1), 900);
    }
  }
  function finish() {
    const r = res.current;
    const ms = r.maxSpan || startSpan - 1;
    onFinish({
      score: Math.round(clamp((ms - 2) / 7, 0, 1) * 100),
      nextLevel: ms > startSpan ? Math.min(20, level + 1) : ms < startSpan ? Math.max(1, level - 1) : level,
      perf: { memory: r2(ms * (backward ? 1.3 : 1)) },
      metrics: { enUzunDizi: ms, dogruDizi: r.correct, deneme: r.trials, yon: backward ? "ters" : "düz" },
      summary: `bellek uzamı ${ms}${backward ? " (ters)" : ""}`,
      highlights: [
        { label: "Bellek uzamı", value: `${ms} kare` },
        { label: "Doğru dizi", value: `${r.correct} / ${r.trials}` },
        { label: "Yön", value: backward ? "Tersten" : "Düz" },
      ],
    });
  }

  return (
    <Stage dark>
      <Hud
        dark
        left={<Pill tone="dark">{phase === "watch" ? "👀 İzle" : phase === "input" ? (backward ? "↩️ TERSTEN tekrarla" : "👆 Aynı sırayla dokun") : "…"}</Pill>}
        right={<Pill tone="dark">Dizi: {span}</Pill>}
      />
      <div className="relative flex flex-1 items-center justify-center p-4">
        <Flash kind={fb} />
        <div className="grid aspect-square w-[min(80vw,calc(100vh-220px),460px)] gap-3" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          {Array.from({ length: n * n }, (_, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                tap(i);
              }}
              className={`no-select rounded-2xl border-2 transition-all duration-100 ${
                lit === i ? "scale-95 border-logo bg-logo shadow-[0_0_30px_#19E3F9]" : "border-white/10 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Sayı Hafızası – digit span
   ============================================================ */
export function SayiHafizasi({ level, sound, onFinish }: GameProps) {
  const backward = level >= 10;
  const startSpan = clamp(3 + Math.floor((level - 1) / 2) - (backward ? 2 : 0), 3, 9);
  const showMs = clamp(900 - level * 20, 550, 900);
  const [span, setSpan] = useState(startSpan);
  const [digits, setDigits] = useState<number[]>([]);
  const [cur, setCur] = useState<number | null>(null);
  const [phase, setPhase] = useState<"watch" | "input" | "fb">("watch");
  const [answer, setAnswer] = useState("");
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const [trial, setTrial] = useState(0);
  const res = useRef({ maxSpan: 0, correct: 0, trials: 0 });
  const wrongStreak = useRef(0);
  const t = useTimers();
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const d: number[] = [];
    while (d.length < span) {
      const v = randInt(0, 9);
      if (d[d.length - 1] !== v) d.push(v);
    }
    setDigits(d);
    setAnswer("");
    setPhase("watch");
    d.forEach((v, i) => {
      t.after(() => {
        setCur(v);
        sfx.tick(sound);
      }, 500 + i * (showMs + 200));
      t.after(() => setCur(null), 500 + i * (showMs + 200) + showMs);
    });
    t.after(() => setPhase("input"), 500 + d.length * (showMs + 200));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  function submit() {
    if (phase !== "input" || !answer) return;
    const expected = (backward ? [...digits].reverse() : digits).join("");
    const ok = answer === expected;
    const r = res.current;
    r.trials += 1;
    setPhase("fb");
    setFb(ok ? "good" : "bad");
    t.after(() => setFb(null), 300);
    const late = performance.now() - startedAt.current > 80000;
    if (ok) {
      r.correct += 1;
      r.maxSpan = Math.max(r.maxSpan, span);
      wrongStreak.current = 0;
      sfx.good(sound);
      if (late || span >= 12) return void t.after(finish, 800);
      setSpan(span + 1);
    } else {
      wrongStreak.current += 1;
      sfx.bad(sound);
      if (wrongStreak.current >= 2 || late) return void t.after(finish, 1200);
    }
    t.after(() => setTrial((x) => x + 1), 1100);
  }
  function finish() {
    const r = res.current;
    const m = r.maxSpan || startSpan - 1;
    onFinish({
      score: Math.round(clamp((m - 2) / 8, 0, 1) * 100),
      nextLevel: m > startSpan ? Math.min(20, level + 2) : m < startSpan ? Math.max(1, level - 1) : level,
      perf: { memory: r2(m * (backward ? 1.35 : 1)) },
      metrics: { enUzunDizi: m, dogru: r.correct, deneme: r.trials, yon: backward ? "ters" : "düz" },
      summary: `sayı uzamı ${m}${backward ? " (ters)" : ""}`,
      highlights: [
        { label: "Sayı uzamı", value: `${m} rakam` },
        { label: "Doğru dizi", value: `${r.correct} / ${r.trials}` },
        { label: "Yön", value: backward ? "Tersten" : "Düz" },
      ],
    });
  }

  return (
    <Stage>
      <Hud left={<Pill tone="brand">{phase === "watch" ? "👀 Rakamları izle" : backward ? "↩️ TERSTEN yaz" : "✍️ Aynı sırayla yaz"}</Pill>} right={<Pill>{span} rakam</Pill>} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 p-4">
        <Flash kind={fb} />
        {phase === "watch" ? (
          <div className="flex h-48 w-48 items-center justify-center rounded-[32px] border border-line bg-white text-8xl font-extrabold shadow-card">
            {cur != null && <span key={Math.random()} style={{ animation: "pop .15s both" }}>{cur}</span>}
          </div>
        ) : (
          <>
            <div className="flex min-h-16 min-w-48 items-center justify-center rounded-2xl border border-line bg-white px-6 text-4xl font-extrabold tracking-[0.3em] tabular-nums shadow-card">
              {phase === "fb" ? (backward ? [...digits].reverse() : digits).join("") : answer || <span className="tracking-normal text-line">• • •</span>}
            </div>
            <Keypad value={answer} onChange={setAnswer} onSubmit={submit} maxLen={14} />
          </>
        )}
      </div>
    </Stage>
  );
}

/* ============================================================
   Hafıza Treni – n-back
   ============================================================ */
export function HafizaTreni({ level, sound, onFinish }: GameProps) {
  const N = level <= 4 ? 1 : level <= 11 ? 2 : 3;
  const LEN = 20 + N;
  const stepMs = clamp(2700 - level * 40, 1900, 2700);
  const seq = useMemo(() => {
    const s: string[] = [];
    for (let i = 0; i < LEN; i++) {
      if (i >= N && Math.random() < 0.32) s.push(s[i - N]);
      else {
        let v = pick(NBACK_LETTERS);
        if (i >= N && v === s[i - N]) v = pick(NBACK_LETTERS.filter((x) => x !== s[i - N]));
        s.push(v);
      }
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [i, setI] = useState(-1);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const responded = useRef(false);
  const res = useRef({ hits: 0, misses: 0, fa: 0, cr: 0 });
  const t = useTimers();

  useEffect(() => {
    t.after(() => setI(0), 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (i < 0) return;
    responded.current = false;
    sfx.tick(sound);
    const id = t.after(() => {
      // score non-response
      if (i >= N && !responded.current) {
        if (seq[i] === seq[i - N]) res.current.misses += 1;
        else res.current.cr += 1;
      }
      if (i + 1 >= LEN) finish();
      else setI(i + 1);
    }, stepMs);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function match() {
    if (i < N || responded.current) return;
    responded.current = true;
    if (seq[i] === seq[i - N]) {
      res.current.hits += 1;
      sfx.good(sound);
      setFb("good");
    } else {
      res.current.fa += 1;
      sfx.bad(sound);
      setFb("bad");
    }
    t.after(() => setFb(null), 250);
  }
  useKeys((e) => {
    if (e.code === "Space") {
      e.preventDefault();
      match();
    }
  });
  function finish() {
    const r = res.current;
    const targets = r.hits + r.misses;
    const nons = r.fa + r.cr;
    const H = targets ? r.hits / targets : 0;
    const F = nons ? r.fa / nons : 0;
    const q = clamp(H - F, 0, 1);
    onFinish({
      score: Math.round(((H + (1 - F)) / 2) * 100),
      nextLevel: q >= 0.75 ? Math.min(20, level + 1) : q < 0.35 ? Math.max(1, level - 1) : level,
      perf: { memory: r2(((H - F + 1) / 2) * N * 10), attention: r2((1 - (1 - H) * 0.5 - F * 0.5) * N * 10) },
      metrics: { N, isabet: r.hits, kacirilan: r.misses, yanlisAlarm: r.fa },
      summary: `${N}-geri · isabet %${Math.round(H * 100)} · yanlış alarm %${Math.round(F * 100)}`,
      highlights: [
        { label: "Seviye", value: `${N}-geri` },
        { label: "İsabet", value: `${r.hits} / ${targets}` },
        { label: "Yanlış alarm", value: String(r.fa) },
      ],
    });
  }

  const visible = seq.slice(Math.max(0, i - 3), i + 1);
  return (
    <Stage>
      <Hud left={<Pill tone="brand">{N} adım önceki ile aynı mı?</Pill>} right={<Pill>{Math.max(0, i + 1)} / {LEN}</Pill>} progress={(i + 1) / LEN} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-10 p-4">
        <Flash kind={fb} />
        <div className="flex items-end gap-2 sm:gap-3">
          <span className="mb-4 text-5xl">🚂</span>
          {visible.map((v, k) => {
            const isCur = k === visible.length - 1;
            return (
              <div
                key={`${i}-${k}`}
                className={`flex items-center justify-center rounded-2xl border-b-8 font-extrabold transition-all ${
                  isCur ? "h-28 w-24 border-carrot-dark bg-carrot text-6xl text-ink sm:h-32 sm:w-28" : "h-20 w-16 border-line bg-white text-3xl text-slate/30 sm:h-24 sm:w-20"
                }`}
                style={isCur ? { animation: "fadeUp .3s both" } : undefined}
              >
                {isCur ? v : "?"}
              </div>
            );
          })}
        </div>
        <BigChoice color="grape" kbd="BOŞLUK" className="w-full max-w-sm" onClick={match}>
          EŞLEŞTİ!
        </BigChoice>
      </div>
    </Stage>
  );
}

/* ============================================================
   Kelime Hafızası – recognition memory
   ============================================================ */
export function KelimeHafizasi({ level, sound, onFinish }: GameProps) {
  const size = clamp(6 + level, 7, 18);
  const studyMs = size * clamp(1300 - level * 25, 800, 1300);
  const { study, test } = useMemo(() => {
    const pool = shuffle(WORDS.filter((w) => w.length >= 3 && w.length <= 9));
    const st = pool.slice(0, size);
    const lures = pool.slice(size, size * 2);
    return { study: st, test: shuffle([...st.map((w) => ({ w, old: true })), ...lures.map((w) => ({ w, old: false }))]) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [phase, setPhase] = useState<"study" | "test">("study");
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const [left, setLeft] = useState(studyMs);
  const res = useRef({ hits: 0, fa: 0, rts: [] as number[] });
  const shownAt = useRef(0);
  const t = useTimers();

  useEffect(() => {
    const start = performance.now();
    const id = t.every(() => {
      const l = studyMs - (performance.now() - start);
      setLeft(l);
      if (l <= 0) {
        t.clear(id);
        shownAt.current = performance.now();
        setPhase("test");
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer(saidOld: boolean) {
    if (phase !== "test") return;
    const it = test[i];
    const r = res.current;
    r.rts.push(performance.now() - shownAt.current);
    const ok = saidOld === it.old;
    if (saidOld && it.old) r.hits += 1;
    if (saidOld && !it.old) r.fa += 1;
    (ok ? sfx.good : sfx.bad)(sound);
    setFb(ok ? "good" : "bad");
    t.after(() => setFb(null), 200);
    if (i + 1 >= test.length) {
      const H = r.hits / size;
      const F = r.fa / size;
      const acc = (r.hits + (size - r.fa)) / (size * 2);
      onFinish({
        score: Math.round(acc * 100),
        nextLevel: nextLevelFrom(level, clamp(H - F + 0.1, 0, 1)),
        perf: { memory: r2(Math.max(0.05, H - F) * size) },
        metrics: { liste: size, isabet: r.hits, yanlisAlarm: r.fa, ortTepki: Math.round(avg(r.rts)) },
        summary: `${r.hits}/${size} kelime tanındı · ${r.fa} yanlış alarm`,
        highlights: [
          { label: "Tanınan", value: `${r.hits} / ${size}` },
          { label: "Yanlış alarm", value: String(r.fa) },
          { label: "Doğruluk", value: pct(acc) },
        ],
      });
      return;
    }
    shownAt.current = performance.now();
    setI(i + 1);
  }
  useKeys((e) => {
    if (e.key.toLowerCase() === "a") answer(true);
    if (e.key.toLowerCase() === "l") answer(false);
  });

  if (phase === "study")
    return (
      <Stage>
        <Hud left={<Pill tone="brand">📝 Kelimeleri aklında tut</Pill>} right={<Pill>⏱ {Math.ceil(left / 1000)} sn</Pill>} progress={1 - left / studyMs} />
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
            {study.map((w) => (
              <div key={w} className="rounded-2xl border border-line bg-white px-3 py-4 text-center text-lg font-extrabold shadow-card sm:text-xl">
                {w}
              </div>
            ))}
          </div>
        </div>
      </Stage>
    );

  return (
    <Stage>
      <Hud left={<Pill tone="brand">Listede var mıydı?</Pill>} right={<Pill>{i + 1} / {test.length}</Pill>} progress={i / test.length} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-10 p-4">
        <Flash kind={fb} />
        <div key={i} className="flex h-40 w-full max-w-xl items-center justify-center rounded-[28px] border border-line bg-white text-5xl font-extrabold shadow-card" style={{ animation: "pop .2s both" }}>
          {test[i]?.w}
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <BigChoice color="brand" kbd="A" onClick={() => answer(true)}>GÖRDÜM</BigChoice>
          <BigChoice color="white" kbd="L" onClick={() => answer(false)}>GÖRMEDİM</BigChoice>
        </div>
      </div>
    </Stage>
  );
}
