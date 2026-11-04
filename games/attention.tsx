"use client";

import { useEffect, useRef, useState } from "react";
import { levelFactor, nextLevelFrom, speedIndex } from "@/lib/engine";
import { COLORS, similarWord, wordsOfLength } from "@/content/words";
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
  randInt,
  sfx,
  shuffle,
  useCountdown,
  useKeys,
  useTimers,
  type GameProps,
} from "@/components/game/kit";

/* ============================================================
   Kelime Avı – visual search among similar words
   ============================================================ */
function makeHunt(level: number) {
  const cols = level <= 3 ? 4 : level <= 8 ? 5 : 6;
  const rows = level <= 3 ? 4 : level <= 8 ? 5 : 6;
  const target = pick(wordsOfLength(level <= 5 ? 4 : 5, level <= 5 ? 6 : 9));
  const copies = randInt(3, Math.min(6, 2 + Math.floor(level / 3) + 2));
  const cells: { w: string; hit: boolean }[] = [];
  for (let i = 0; i < copies; i++) cells.push({ w: target, hit: true });
  while (cells.length < cols * rows) {
    const d = level <= 2 && Math.random() < 0.4 ? pick(wordsOfLength(4, 8)) : similarWord(target);
    if (d !== target) cells.push({ w: d, hit: false });
  }
  return { target, cols, cells: shuffle(cells).map((c, i) => ({ ...c, id: i, found: false })), copies };
}

export function KelimeAvi({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const [board, setBoard] = useState(() => makeHunt(level));
  const [wrong, setWrong] = useState<number | null>(null);
  const stats = useRef({ found: 0, wrong: 0, boards: 0, times: [] as number[], last: performance.now() });
  const done = useRef(false);

  function tap(id: number) {
    if (done.current) return;
    const c = board.cells[id];
    if (c.found) return;
    const s = stats.current;
    if (c.hit) {
      const now = performance.now();
      s.times.push(now - s.last);
      s.last = now;
      s.found += 1;
      sfx.pop(sound);
      const cells = board.cells.map((x) => (x.id === id ? { ...x, found: true } : x));
      if (cells.filter((x) => x.hit && !x.found).length === 0) {
        s.boards += 1;
        sfx.good(sound);
        setTimeout(() => setBoard(makeHunt(level)), 250);
      }
      setBoard({ ...board, cells });
    } else {
      s.wrong += 1;
      sfx.bad(sound);
      setWrong(id);
      setTimeout(() => setWrong(null), 300);
    }
  }

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const acc = s.found / Math.max(1, s.found + s.wrong);
    const perMin = s.found;
    onFinish({
      score: Math.round(clamp((perMin / (14 + level)) * acc, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, clamp((perMin / (12 + level)) * acc, 0, 1)),
      perf: { attention: r2(perMin * acc * levelFactor(level)) },
      metrics: { bulunan: s.found, yanlis: s.wrong, tablo: s.boards },
      summary: `${s.found} kelime bulundu · ${s.wrong} yanlış`,
      highlights: [
        { label: "Bulunan", value: String(s.found) },
        { label: "Tamamlanan tablo", value: String(s.boards) },
        { label: "Doğruluk", value: pct(acc) },
      ],
    });
  });

  const remaining = board.cells.filter((x) => x.hit && !x.found).length;
  return (
    <Stage>
      <Hud left={<Pill tone="carrot">Hedef: <b className="text-base">{board.target}</b></Pill>} right={<><Pill>{remaining} kaldı</Pill><TimeLeft left={left} /></>} progress={1 - left / DURATION} />
      <div className="flex flex-1 items-center justify-center p-3 sm:p-6">
        <div className="grid w-full max-w-3xl gap-2" style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0,1fr))` }}>
          {board.cells.map((c) => (
            <button
              key={c.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                tap(c.id);
              }}
              className={`no-select truncate rounded-xl border px-1 py-3 text-sm font-bold transition sm:py-4 sm:text-lg ${
                c.found ? "border-brand bg-brand text-white" : wrong === c.id ? "shake border-rose-300 bg-rose-100" : "border-line bg-white hover:bg-cream"
              }`}
            >
              {c.w}
            </button>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Dur – Geç (Go / No-Go)
   ============================================================ */
export function DurGec({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const isi = clamp(1250 - level * 35, 650, 1250);
  const show = clamp(800 - level * 22, 420, 800);
  const nogo = level >= 10 ? "🐻" : "🦊";
  const [stim, setStim] = useState<{ go: boolean; id: number } | null>(null);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const cur = useRef<{ go: boolean; at: number; responded: boolean } | null>(null);
  const stats = useRef({ go: 0, nogo: 0, hits: 0, fa: 0, rts: [] as number[] });
  const t = useTimers();
  const done = useRef(false);

  useEffect(() => {
    let n = 0;
    const id = t.every(() => {
      if (done.current) return;
      const prev = cur.current;
      if (prev && prev.go && !prev.responded) {
        /* miss */
      }
      const go = Math.random() < 0.75;
      if (go) stats.current.go += 1;
      else stats.current.nogo += 1;
      cur.current = { go, at: performance.now(), responded: false };
      setStim({ go, id: ++n });
      t.after(() => setStim((s) => (s && s.id === n ? null : s)), show);
    }, isi);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function press() {
    if (done.current) return;
    const c = cur.current;
    if (!c || c.responded) return;
    c.responded = true;
    if (c.go) {
      stats.current.hits += 1;
      stats.current.rts.push(performance.now() - c.at);
      sfx.pop(sound);
      setFb("good");
    } else {
      stats.current.fa += 1;
      sfx.bad(sound);
      setFb("bad");
    }
    setStim(null);
    t.after(() => setFb(null), 200);
  }
  useKeys((e) => {
    if (e.code === "Space") {
      e.preventDefault();
      press();
    }
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const hr = s.go ? s.hits / s.go : 0;
    const far = s.nogo ? s.fa / s.nogo : 0;
    const q = (hr + (1 - far)) / 2;
    const rt = avg(s.rts);
    onFinish({
      score: Math.round(q * 100),
      nextLevel: nextLevelFrom(level, q),
      perf: { attention: Math.max(0.05, q) * levelFactor(level) * 100, reaction: speedIndex(rt, Math.max(0.1, hr)) },
      metrics: { isabet: Math.round(hr * 100), yanlisAlarm: Math.round(far * 100), ortTepki: Math.round(rt) },
      summary: `isabet %${Math.round(hr * 100)} · tilkiye basma %${Math.round(far * 100)}`,
      highlights: [
        { label: "Tavşan isabeti", value: pct(hr) },
        { label: `${nogo} ye basma`, value: pct(far) },
        { label: "Ort. tepki", value: rt ? ms(rt) : "–" },
      ],
    });
  });

  return (
    <Stage dark>
      <Hud dark left={<Pill tone="dark">🐰 bas · {nogo} basma</Pill>} right={<TimeLeft dark left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 items-center justify-center" onPointerDown={press}>
        <Flash kind={fb} />
        <div className="flex h-56 w-56 items-center justify-center rounded-full border-4 border-white/10 bg-white/5 sm:h-72 sm:w-72">
          {stim && (
            <span key={stim.id} className="text-[110px] sm:text-[140px]" style={{ animation: "pop .18s both" }}>
              {stim.go ? "🐰" : nogo}
            </span>
          )}
        </div>
        <span className="absolute bottom-6 text-sm font-bold text-white/50">Ekrana dokun ya da BOŞLUK</span>
      </div>
    </Stage>
  );
}

/* ============================================================
   Ok Yağmuru – Eriksen Flanker
   ============================================================ */
export function OkYagmuru({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const deadline = clamp(2200 - level * 70, 900, 2200);
  const make = () => {
    const dir: "L" | "R" = Math.random() < 0.5 ? "L" : "R";
    const r = Math.random();
    const type: "con" | "inc" | "neu" = level <= 2 ? (r < 0.5 ? "con" : "inc") : r < 0.4 ? "con" : r < 0.85 ? "inc" : "neu";
    const c = dir === "L" ? "←" : "→";
    const f = type === "con" ? c : type === "inc" ? (dir === "L" ? "→" : "←") : "—";
    const offset = level >= 8 ? randInt(-25, 25) : 0;
    return { dir, type, text: `${f}${f}${c}${f}${f}`, offset, id: Math.random() };
  };
  const [trial, setTrial] = useState<ReturnType<typeof make> | null>(null);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const shownAt = useRef(0);
  const stats = useRef({ n: 0, correct: 0, rtCon: [] as number[], rtInc: [] as number[], incN: 0, incC: 0, all: [] as number[] });
  const t = useTimers();
  const dl = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const done = useRef(false);

  function next() {
    setTrial(null);
    t.after(() => {
      if (done.current) return;
      const tr = make();
      setTrial(tr);
      shownAt.current = performance.now();
      t.clear(dl.current);
      dl.current = t.after(() => {
        stats.current.n += 1;
        if (tr.type === "inc") stats.current.incN += 1;
        sfx.bad(sound);
        next();
      }, deadline);
    }, 380);
  }
  useEffect(() => {
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer(d: "L" | "R") {
    if (!trial || done.current) return;
    t.clear(dl.current);
    const s = stats.current;
    const rt = performance.now() - shownAt.current;
    const ok = d === trial.dir;
    s.n += 1;
    if (trial.type === "inc") s.incN += 1;
    if (ok) {
      s.correct += 1;
      s.all.push(rt);
      if (trial.type === "con") s.rtCon.push(rt);
      if (trial.type === "inc") {
        s.rtInc.push(rt);
        s.incC += 1;
      }
      sfx.pop(sound);
    } else sfx.bad(sound);
    setFb(ok ? "good" : "bad");
    t.after(() => setFb(null), 180);
    next();
  }
  useKeys((e) => {
    if (e.key === "ArrowLeft") answer("L");
    if (e.key === "ArrowRight") answer("R");
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const acc = s.n ? s.correct / s.n : 0;
    const accInc = s.incN ? s.incC / s.incN : acc;
    const cost = s.rtInc.length && s.rtCon.length ? avg(s.rtInc) - avg(s.rtCon) : 0;
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc),
      perf: {
        attention: speedIndex(avg(s.rtInc.length ? s.rtInc : s.all), Math.max(0.1, accInc)) * levelFactor(level),
        reaction: speedIndex(avg(s.all), Math.max(0.1, acc)),
      },
      metrics: { deneme: s.n, dogru: s.correct, catismaMaliyeti: Math.round(cost), ortTepki: Math.round(avg(s.all)) },
      summary: `${s.correct}/${s.n} doğru · çatışma maliyeti ${Math.round(cost)} ms`,
      highlights: [
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. tepki", value: ms(avg(s.all)) },
        { label: "Çatışma maliyeti", value: `${Math.round(cost)} ms` },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">Ortadaki ok!</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-10 px-4">
        <Flash kind={fb} />
        <div className="flex h-40 w-full max-w-3xl items-center justify-center rounded-[28px] border border-line bg-white shadow-card">
          {trial && (
            <span className="no-select font-extrabold tracking-[0.15em] text-ink" style={{ fontSize: "clamp(44px,10vw,96px)", transform: `translateX(${trial.offset}px)` }}>
              {trial.text}
            </span>
          )}
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <BigChoice color="deep" kbd="←" onClick={() => answer("L")}>← SOL</BigChoice>
          <BigChoice color="deep" kbd="→" onClick={() => answer("R")}>SAĞ →</BigChoice>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Renk Tuzağı – Stroop
   ============================================================ */
export function RenkTuzagi({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const make = () => {
    const word = pick(COLORS);
    const congruent = Math.random() < (level <= 2 ? 0.4 : 0.25);
    const ink = congruent ? word : pick(COLORS.filter((c) => c.name !== word.name));
    return { word: word.name, ink, congruent, id: Math.random() };
  };
  const [trial, setTrial] = useState(make);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const shownAt = useRef(performance.now());
  const stats = useRef({ n: 0, correct: 0, inc: [] as number[], incN: 0, incC: 0, all: [] as number[] });
  const done = useRef(false);
  const order = useRef(level >= 7 ? shuffle(COLORS) : COLORS);

  function answer(name: string) {
    if (done.current) return;
    const s = stats.current;
    const rt = performance.now() - shownAt.current;
    const ok = name === trial.ink.name;
    s.n += 1;
    if (!trial.congruent) s.incN += 1;
    if (ok) {
      s.correct += 1;
      s.all.push(rt);
      if (!trial.congruent) {
        s.inc.push(rt);
        s.incC += 1;
      }
      sfx.pop(sound);
    } else sfx.bad(sound);
    setFb(ok ? "good" : "bad");
    setTimeout(() => setFb(null), 180);
    setTrial(make());
    shownAt.current = performance.now();
    if (level >= 12 && s.n % 6 === 0) order.current = shuffle(COLORS);
  }
  useKeys((e) => {
    const k = parseInt(e.key, 10);
    if (k >= 1 && k <= 4) answer(order.current[k - 1].name);
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const acc = s.n ? s.correct / s.n : 0;
    const accInc = s.incN ? s.incC / s.incN : acc;
    onFinish({
      score: Math.round(acc * 100),
      nextLevel: nextLevelFrom(level, acc - (avg(s.all) > 1600 ? 0.1 : 0)),
      perf: {
        attention: speedIndex(avg(s.inc.length ? s.inc : s.all), Math.max(0.1, accInc)) * levelFactor(level),
        reaction: speedIndex(avg(s.all), Math.max(0.1, acc)),
      },
      metrics: { deneme: s.n, dogru: s.correct, ortTepki: Math.round(avg(s.all)) },
      summary: `${s.correct}/${s.n} doğru · ort. ${Math.round(avg(s.all))} ms`,
      highlights: [
        { label: "Doğru", value: `${s.correct} / ${s.n}` },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. tepki", value: ms(avg(s.all)) },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">Yazının RENGİNİ seç</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-10 px-4">
        <Flash kind={fb} />
        <div key={trial.id} className="flex h-40 w-full max-w-2xl items-center justify-center rounded-[28px] border border-line bg-white shadow-card" style={{ animation: "pop .18s both" }}>
          <span className="no-select font-extrabold tracking-wide" style={{ color: trial.ink.hex, fontSize: "clamp(40px,9vw,80px)" }}>
            {trial.word}
          </span>
        </div>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          {order.current.map((c, i) => (
            <button
              key={c.name}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                answer(c.name);
              }}
              className="btn-3d no-select flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-white px-3 py-3 font-extrabold shadow-[0_5px_0_#CBD5D1] active:translate-y-1 active:shadow-none"
            >
              <span className="h-7 w-7 rounded-full" style={{ background: c.hex }} />
              <span className="text-xs text-slate">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Farklı Olanı Bul – odd one out
   ============================================================ */
const ODD_SETS: [string, string][][] = [
  [["🐰", "🐻"], ["🥕", "🍎"], ["⭐", "🌙"], ["🚀", "🚗"]],
  [["🙂", "🙃"], ["🐱", "🐯"], ["🍊", "🍑"], ["🌲", "🌳"]],
  [["b", "d"], ["p", "q"], ["6", "9"], ["m", "n"], ["E", "F"]],
  [["ı", "i"], ["ş", "s"], ["ö", "o"], ["ğ", "g"], ["O", "Q"], ["C", "G"], ["8", "B"]],
];

export function FarkliOlan({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const [sub, setSub] = useState(0);
  const make = (s: number) => {
    const n = clamp(3 + Math.floor((level + s) / 3), 3, 8);
    const setIdx = clamp(Math.floor((level - 1) / 4) + (s >= 4 ? 1 : 0), 0, ODD_SETS.length - 1);
    const [a, b] = shuffle(pick(ODD_SETS[setIdx]));
    return { n, base: a, odd: b, at: randInt(0, n * n - 1), id: Math.random(), rot: setIdx >= 2 && level >= 10 };
  };
  const [g, setG] = useState(() => make(0));
  const [wrong, setWrong] = useState<number | null>(null);
  const stats = useRef({ found: 0, wrong: 0, times: [] as number[], last: performance.now(), cells: 0 });
  const done = useRef(false);

  function tap(i: number) {
    if (done.current) return;
    const s = stats.current;
    if (i === g.at) {
      const now = performance.now();
      s.times.push(now - s.last);
      s.last = now;
      s.found += 1;
      s.cells += g.n * g.n;
      sfx.good(sound);
      const ns = sub + 1;
      setSub(ns);
      setG(make(ns));
    } else {
      s.wrong += 1;
      sfx.bad(sound);
      setWrong(i);
      setTimeout(() => setWrong(null), 300);
    }
  }

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const acc = s.found / Math.max(1, s.found + s.wrong);
    const cellsPerSec = s.cells / DURATION;
    onFinish({
      score: Math.round(clamp((s.found / (10 + level)) * acc, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, clamp((s.found / (8 + level)) * acc, 0, 1)),
      perf: { attention: r2(cellsPerSec * acc * levelFactor(level)), reaction: speedIndex(avg(s.times), Math.max(0.1, acc)) },
      metrics: { bulunan: s.found, yanlis: s.wrong, taranan: s.cells },
      summary: `${s.found} fark bulundu · ${s.wrong} yanlış`,
      highlights: [
        { label: "Bulunan", value: String(s.found) },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. bulma", value: ms(avg(s.times)) },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">{stats.current.found} bulundu</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="flex flex-1 items-center justify-center p-3 sm:p-6">
        <div key={g.id} className="grid aspect-square w-full max-w-[min(560px,calc(100vh-240px))] gap-1.5" style={{ gridTemplateColumns: `repeat(${g.n}, 1fr)`, animation: "pop .2s both" }}>
          {Array.from({ length: g.n * g.n }, (_, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                tap(i);
              }}
              className={`no-select flex items-center justify-center rounded-xl border border-line font-extrabold ${wrong === i ? "shake bg-rose-100" : "bg-white"}`}
              style={{ fontSize: `clamp(14px, ${30 / g.n}vmin, 44px)` }}
            >
              <span style={{ transform: g.rot ? `rotate(${(i * 37) % 30 - 15}deg)` : undefined }}>{i === g.at ? g.odd : g.base}</span>
            </button>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Tepki Avcısı – simple & choice reaction time
   ============================================================ */
export function TepkiAvcisi({ level, sound, onFinish }: GameProps) {
  const TRIALS = 12;
  const choice = level >= 4;
  const [state, setState] = useState<"wait" | "go" | "early" | "between">("between");
  const [side, setSide] = useState<"L" | "R">("L");
  const [last, setLast] = useState<number | null>(null);
  const [trial, setTrial] = useState(0);
  const goAt = useRef(0);
  const stats = useRef({ rts: [] as number[], early: 0, wrongSide: 0 });
  const t = useTimers();
  const finished = useRef(false);

  function arm() {
    setState("wait");
    t.after(() => {
      setSide(Math.random() < 0.5 ? "L" : "R");
      goAt.current = performance.now();
      setState("go");
    }, randInt(1000, 3200));
  }
  useEffect(() => {
    t.after(arm, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(s?: "L" | "R") {
    if (finished.current) return;
    if (state === "wait") {
      t.clearAll();
      stats.current.early += 1;
      sfx.bad(sound);
      setState("early");
      t.after(arm, 1100);
      return;
    }
    if (state !== "go") return;
    const rt = performance.now() - goAt.current;
    if (choice && s && s !== side) {
      stats.current.wrongSide += 1;
      sfx.bad(sound);
    } else {
      stats.current.rts.push(rt);
      sfx.good(sound);
    }
    setLast(rt);
    setState("between");
    const n = trial + 1;
    setTrial(n);
    if (n >= TRIALS) finish();
    else t.after(arm, 700);
  }
  function finish() {
    finished.current = true;
    const s = stats.current;
    const valid = s.rts.length;
    const acc = valid / (valid + s.early + s.wrongSide || 1);
    const rts = [...s.rts].sort((a, b) => a - b);
    const trimmed = rts.length > 4 ? rts.slice(1, -1) : rts;
    const mean = avg(trimmed);
    const target = choice ? 420 : 330;
    const score = clamp(Math.round(100 - (mean - target * 0.75) / 4) * acc, 0, 100);
    onFinish({
      score: Math.round(score),
      nextLevel: nextLevelFrom(level, mean < target && acc > 0.85 ? 0.9 : mean > target * 1.4 || acc < 0.7 ? 0.4 : 0.7),
      perf: { reaction: speedIndex(mean, Math.max(0.1, acc)) },
      metrics: { ortTepki: Math.round(mean), enIyi: Math.round(rts[0] || 0), erken: s.early, yanlisYon: s.wrongSide, tur: choice ? "seçimli" : "basit" },
      summary: `ortalama ${Math.round(mean)} ms · en iyi ${Math.round(rts[0] || 0)} ms`,
      highlights: [
        { label: "Ortalama tepki", value: ms(mean) },
        { label: "En iyi", value: ms(rts[0] || 0) },
        { label: "Erken basma", value: String(s.early) },
        ...(choice ? [{ label: "Yanlış yön", value: String(s.wrongSide) }] : []),
      ],
    });
  }
  useKeys((e) => {
    if (e.code === "Space") {
      e.preventDefault();
      respond();
    }
    if (e.key === "ArrowLeft") respond("L");
    if (e.key === "ArrowRight") respond("R");
  });

  const bg = state === "go" ? "bg-emerald-500" : state === "early" ? "bg-rose-500" : "bg-deep";
  return (
    <Stage className={`${bg} text-white transition-colors duration-75`}>
      <Hud dark left={<Pill tone="dark">{choice ? "Seçimli tepki" : "Basit tepki"}</Pill>} right={<Pill tone="dark">{Math.min(trial + 1, TRIALS)} / {TRIALS}</Pill>} progress={trial / TRIALS} />
      <div
        className="no-select relative flex flex-1 items-center justify-center"
        onPointerDown={(e) => {
          if (!choice) return respond();
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          respond(e.clientX - rect.left < rect.width / 2 ? "L" : "R");
        }}
      >
        {choice && <div className="pointer-events-none absolute inset-y-6 left-1/2 w-px bg-white/15" />}
        {state === "wait" && <span className="text-3xl font-extrabold text-white/80">Bekle…</span>}
        {state === "early" && <span className="text-3xl font-extrabold">Erken bastın! 🙈</span>}
        {state === "between" && <span className="text-2xl font-extrabold text-white/80">{last ? `${Math.round(last)} ms` : "Hazır ol"}</span>}
        {state === "go" && (
          <span className={`absolute text-[120px] ${choice ? (side === "L" ? "left-[22%]" : "right-[22%]") : ""}`} style={{ animation: "pop .12s both" }}>
            🥕
          </span>
        )}
        <span className="absolute bottom-6 text-sm font-bold text-white/60">{choice ? "Havucun olduğu tarafa dokun (← →)" : "Havuç çıkınca dokun / BOŞLUK"}</span>
      </div>
    </Stage>
  );
}
