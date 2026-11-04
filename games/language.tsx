"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { levelFactor, nextLevelFrom } from "@/lib/engine";
import { PRACTICE_TEXTS } from "@/content/texts";
import { ANTONYMS, SENTENCES_LONG, SENTENCES_SHORT, SYNONYMS } from "@/content/language";
import { WORDS } from "@/content/words";
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
   Doğru mu, Yanlış mı? – silent sentence verification (TOSREC-style)
   ============================================================ */
export function CumleDogrulama({ level, sound, onFinish }: GameProps) {
  const DURATION = 90;
  const pool = useMemo(
    () => shuffle(level <= 4 ? SENTENCES_SHORT : level <= 9 ? [...SENTENCES_SHORT, ...SENTENCES_LONG] : [...SENTENCES_LONG, ...SENTENCES_SHORT.slice(0, 12)]),
    [level]
  );
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<"good" | "bad" | null>(null);
  const shownAt = useRef(performance.now());
  const stats = useRef({ correct: 0, wrong: 0, words: 0, rts: [] as number[] });
  const done = useRef(false);
  const t = useTimers();
  const cur = pool[i % pool.length];

  function answer(v: boolean) {
    if (done.current) return;
    const s = stats.current;
    const ok = v === cur[1];
    if (ok) {
      s.correct += 1;
      s.words += cur[0].split(/\s+/).length;
      s.rts.push(performance.now() - shownAt.current);
      sfx.pop(sound);
    } else {
      s.wrong += 1;
      sfx.bad(sound);
    }
    setFb(ok ? "good" : "bad");
    t.after(() => setFb(null), 160);
    shownAt.current = performance.now();
    setI(i + 1);
  }
  useKeys((e) => {
    if (e.key.toLowerCase() === "a") answer(true);
    if (e.key.toLowerCase() === "l") answer(false);
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const n = s.correct + s.wrong;
    const acc = n ? s.correct / n : 0;
    const mins = DURATION / 60;
    const netPerMin = Math.max(0, s.correct - s.wrong) / mins;
    const verifiedWpm = Math.round(s.words / mins);
    onFinish({
      score: Math.round(clamp(netPerMin / 22, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, acc >= 0.9 && netPerMin >= 12 ? 0.9 : acc - 0.2),
      perf: { reading: r2(Math.max(1, verifiedWpm) * acc), attention: r2(Math.max(0.05, acc) * levelFactor(level) * 100) },
      metrics: { dogru: s.correct, yanlis: s.wrong, netDakika: r2(netPerMin), dogrulanmisHiz: verifiedWpm },
      summary: `${s.correct} doğru · ${s.wrong} yanlış · dakikada ${r2(netPerMin)} net cümle`,
      highlights: [
        { label: "Net cümle / dk", value: String(r2(netPerMin)) },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Anlayarak okuma", value: `${verifiedWpm} k/dk` },
        { label: "Ort. süre", value: s.rts.length ? ms(avg(s.rts)) : "–" },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">{stats.current.correct} doğru</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <Flash kind={fb} />
        <div key={i} className="flex min-h-40 w-full max-w-3xl items-center justify-center rounded-[28px] border border-line bg-surface px-6 py-8 text-center shadow-card" style={{ animation: "pop .18s both" }}>
          <span className="read-text font-bold text-ink" style={{ ["--read-base" as string]: "clamp(22px,4.2vw,36px)", ["--read-lh" as string]: 1.35 }}>
            {cur[0]}
          </span>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <BigChoice color="brand" kbd="A" onClick={() => answer(true)}>DOĞRU ✓</BigChoice>
          <BigChoice color="carrot" kbd="L" onClick={() => answer(false)}>YANLIŞ ✗</BigChoice>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Labirent Okuma – maze task (every ~7th word becomes a 3-way choice)
   ============================================================ */
interface MazeToken {
  word: string;
  /** trailing punctuation shown after a maze choice */
  punct?: string;
  maze?: { options: string[]; answer: string; picked?: string };
}

function buildMaze(seed: number, level: number): MazeToken[] {
  const a = PRACTICE_TEXTS[Math.abs(seed) % PRACTICE_TEXTS.length];
  const b = PRACTICE_TEXTS[Math.abs(seed + 5) % PRACTICE_TEXTS.length];
  const body = level >= 8 ? `${a.body} ${b.body}` : a.body;
  const every = level >= 12 ? 5 : level >= 6 ? 6 : 7;
  const words = body.split(/\s+/).filter(Boolean);
  let gap = 0;
  return words.map((w, i) => {
    gap++;
    const m = w.match(/^([\p{L}\p{N}'’]+)([^\p{L}\p{N}]*)$/u);
    if (i > 3 && gap >= every && m && m[1].length >= 3) {
      gap = 0;
      const ans = m[1];
      const len = ans.length;
      const pool = WORDS.filter((x) => Math.abs(x.length - len) <= 2 && x.toLocaleLowerCase("tr") !== ans.toLocaleLowerCase("tr"));
      const d = shuffle(pool).slice(0, 2);
      const cap = (x: string) => (ans[0] === ans[0].toLocaleUpperCase("tr") ? x[0].toLocaleUpperCase("tr") + x.slice(1) : x);
      return { word: ans, punct: m[2], maze: { options: shuffle([ans, ...d.map(cap)]), answer: ans } };
    }
    return { word: w };
  });
}

export function LabirentOkuma({ level, seed, sound, onFinish }: GameProps) {
  const DURATION = 120;
  const [tokens, setTokens] = useState<MazeToken[]>(() => buildMaze(seed, level));
  const total = tokens.filter((t) => t.maze).length;
  const curIdx = tokens.findIndex((t) => t.maze && !t.maze.picked);
  const stats = useRef({ correct: 0, wrong: 0, start: performance.now() });
  const done = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function finish() {
    if (done.current) return;
    done.current = true;
    const s = stats.current;
    const n = s.correct + s.wrong;
    const acc = n ? s.correct / n : 0;
    const mins = Math.max(0.25, (performance.now() - s.start) / 60000);
    const perMin = s.correct / mins;
    onFinish({
      score: Math.round(clamp((perMin / 10) * acc, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, acc >= 0.9 && perMin >= 6 ? 0.9 : acc - 0.15),
      perf: { reading: r2(Math.max(0.1, perMin) * acc * 10), attention: r2(Math.max(0.05, acc) * levelFactor(level) * 100) },
      metrics: { dogru: s.correct, yanlis: s.wrong, toplam: total, dakikada: r2(perMin) },
      summary: `${s.correct}/${n} doğru seçim · dakikada ${r2(perMin)}`,
      highlights: [
        { label: "Doğru seçim", value: `${s.correct} / ${n}` },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Dakikada doğru", value: String(r2(perMin)) },
      ],
    });
  }
  const left = useCountdown(DURATION, true, finish);

  function choose(i: number, opt: string) {
    if (done.current || i !== curIdx) return;
    const tk = tokens[i];
    const ok = opt === tk.maze!.answer;
    if (ok) {
      stats.current.correct += 1;
      sfx.pop(sound);
    } else {
      stats.current.wrong += 1;
      sfx.bad(sound);
    }
    const next = tokens.map((t, k) => (k === i ? { ...t, maze: { ...t.maze!, picked: opt } } : t));
    setTokens(next);
    if (!next.some((t) => t.maze && !t.maze.picked)) setTimeout(finish, 400);
    // keep the active choice in view
    setTimeout(() => {
      const el = scrollRef.current?.querySelector<HTMLElement>("[data-current]");
      const sc = scrollRef.current;
      if (el && sc) sc.scrollTo({ top: Math.max(0, el.offsetTop - sc.clientHeight * 0.4), behavior: "smooth" });
    }, 50);
  }

  return (
    <Stage className="!bg-cream">
      <Hud left={<Pill tone="brand">🧭 {stats.current.correct + stats.current.wrong} / {total}</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <p className="read-text relative mx-auto max-w-2xl px-5 pb-[40vh] pt-8 font-medium text-ink sm:px-8" style={{ ["--read-base" as string]: "20px", ["--read-lh" as string]: 2.3 }}>
          {tokens.map((t, i) => {
            if (!t.maze) return <span key={i}>{t.word} </span>;
            const picked = t.maze.picked;
            if (picked)
              return (
                <span key={i}>
                  <span className={`rounded-md px-1 font-extrabold ${picked === t.maze.answer ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-600 line-through decoration-2 dark:text-rose-300"}`}>
                    {picked === t.maze.answer ? picked : t.maze.answer}
                  </span>
                  {t.punct}{" "}
                </span>
              );
            if (i !== curIdx)
              return (
                <span key={i} className="text-muted">
                  ⟨ … ⟩{t.punct}{" "}
                </span>
              );
            return (
              <span key={i} data-current className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-brand-soft p-1 align-middle">
                {t.maze.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => choose(i, o)}
                    className="rounded-lg border border-line bg-surface px-2.5 py-0.5 text-[0.9em] font-extrabold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-brand"
                  >
                    {o}
                  </button>
                ))}
                <span>{t.punct}</span>
              </span>
            );
          })}
        </p>
      </div>
    </Stage>
  );
}

/* ============================================================
   Kelime Ustası – synonyms & antonyms
   ============================================================ */
function makeVocab(level: number) {
  const anto = level <= 3 ? true : Math.random() < 0.5;
  const list = anto ? ANTONYMS : SYNONYMS;
  const pair = pick(list);
  const flip = Math.random() < 0.5;
  const word = flip ? pair[1] : pair[0];
  const answer = flip ? pair[0] : pair[1];
  const related = new Set([word, answer]);
  const all = [...SYNONYMS, ...ANTONYMS].flat().filter((w) => !related.has(w));
  const distract = shuffle(Array.from(new Set(all))).slice(0, 3);
  return { kind: anto ? "ZIT ANLAMLISI" : "EŞ ANLAMLISI", word, answer, options: shuffle([answer, ...distract]), id: Math.random() };
}

export function KelimeUstasi({ level, sound, onFinish }: GameProps) {
  const DURATION = 60;
  const deadline = clamp(7000 - level * 250, 2500, 7000);
  const [q, setQ] = useState(() => makeVocab(level));
  const [picked, setPicked] = useState<string | null>(null);
  const shownAt = useRef(performance.now());
  const stats = useRef({ correct: 0, wrong: 0, rts: [] as number[] });
  const done = useRef(false);
  const t = useTimers();
  const dl = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function arm() {
    t.clear(dl.current);
    dl.current = t.after(() => {
      if (done.current) return;
      stats.current.wrong += 1;
      sfx.bad(sound);
      next();
    }, deadline);
  }
  function next() {
    setPicked(null);
    setQ(makeVocab(level));
    shownAt.current = performance.now();
    arm();
  }
  useEffect(() => {
    arm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function choose(o: string) {
    if (done.current || picked) return;
    t.clear(dl.current);
    setPicked(o);
    const ok = o === q.answer;
    if (ok) {
      stats.current.correct += 1;
      stats.current.rts.push(performance.now() - shownAt.current);
      sfx.good(sound);
    } else {
      stats.current.wrong += 1;
      sfx.bad(sound);
    }
    t.after(next, ok ? 350 : 900);
  }
  useKeys((e) => {
    const k = parseInt(e.key, 10);
    if (k >= 1 && k <= 4 && q.options[k - 1]) choose(q.options[k - 1]);
  });

  const left = useCountdown(DURATION, true, () => {
    done.current = true;
    const s = stats.current;
    const n = s.correct + s.wrong;
    const acc = n ? s.correct / n : 0;
    onFinish({
      score: Math.round(clamp((s.correct / 22) * acc, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, acc),
      perf: { memory: r2(Math.max(0.2, s.correct) * acc * levelFactor(level)) },
      metrics: { dogru: s.correct, yanlis: s.wrong, ortSure: Math.round(avg(s.rts)) },
      summary: `${s.correct} kelime doğru · ${pct(acc)}`,
      highlights: [
        { label: "Doğru", value: String(s.correct) },
        { label: "Doğruluk", value: pct(acc) },
        { label: "Ort. süre", value: s.rts.length ? ms(avg(s.rts)) : "–" },
      ],
    });
  });

  return (
    <Stage>
      <Hud left={<Pill tone="brand">📚 {stats.current.correct} doğru</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div key={q.id} className="flex w-full max-w-2xl flex-col items-center gap-2 rounded-[28px] border border-line bg-surface px-6 py-8 text-center shadow-card" style={{ animation: "pop .2s both" }}>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-widest ${q.kind.startsWith("ZIT") ? "bg-peach text-ink" : "bg-brand-soft text-ink"}`}>{q.kind}</span>
          <span className="text-5xl font-extrabold text-ink">{q.word}</span>
        </div>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
          {q.options.map((o, i) => {
            const state = !picked ? "" : o === q.answer ? "!bg-emerald-500 !text-white" : o === picked ? "!bg-rose-500 !text-white shake" : "opacity-50";
            return (
              <BigChoice key={o} color="white" kbd={String(i + 1)} className={state} onClick={() => choose(o)}>
                {o}
              </BigChoice>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}
