"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PRACTICE_TEXTS, TEST_TEXTS, wordCount, type ReadingText } from "@/content/texts";
import { Quiz } from "@/components/game/Quiz";
import { BigChoice, Hud, Pill, Stage, sfx, useTimers, type GameOutcome, type GameProps } from "@/components/game/kit";

function practiceText(seed: number, custom?: GameProps["customText"]): ReadingText {
  if (custom) return { id: "kendi-metnim", title: custom.title, body: custom.body, questions: [] };
  return PRACTICE_TEXTS[Math.abs(seed) % PRACTICE_TEXTS.length];
}

/** inline style for .read-text with a base size and line height */
const RS = (base: number, lh: number) => ({ ["--read-base" as string]: `${base}px`, ["--read-lh" as string]: lh }) as React.CSSProperties;

function practiceOutcome(text: ReadingText, wpm: number, seconds: number, correct: number, level: number, mode: string): GameOutcome {
  const comp = text.questions.length ? correct / text.questions.length : 0;
  const words = wordCount(text.body);
  const ers = Math.round(wpm * comp);
  return {
    score: Math.round(comp * 100),
    nextLevel: comp >= 0.67 ? Math.min(20, level + 1) : Math.max(1, level - (comp < 0.34 ? 1 : 0)),
    perf: { reading: Math.max(1, ers) },
    metrics: { wpm, comprehension: Math.round(comp * 100), words, mode },
    summary: `${wpm} kelime/dk · anlama %${Math.round(comp * 100)}`,
    highlights: [
      { label: "Okuma hızı", value: `${wpm} k/dk` },
      { label: "Anlama", value: `%${Math.round(comp * 100)}` },
      { label: "Etkili hız", value: `${ers} k/dk` },
    ],
    reading: { textId: text.id, words, seconds, wpm, comprehension: comp, kind: "practice" },
  };
}

/* ============================================================
   Okuma Hızı Testi
   ============================================================ */
export function OkumaTesti({ testsTaken, sound, onFinish, level }: GameProps) {
  const text = TEST_TEXTS[testsTaken % TEST_TEXTS.length];
  const words = useMemo(() => wordCount(text.body), [text]);
  const [phase, setPhase] = useState<"ready" | "reading" | "quiz">("ready");
  const start = useRef(0);
  const secs = useRef(0);

  if (phase === "ready")
    return (
      <Stage>
        <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="text-6xl">📄</div>
          <h3 className="text-3xl font-extrabold">{text.title}</h3>
          <p className="text-lg font-semibold text-slate">
            {words} kelimelik bir metin. Normal hızında, <b>anlayarak</b> oku. Süre arka planda tutulur – ekranda sayaç görmeyeceksin.
          </p>
          <BigChoice
            onClick={() => {
              start.current = performance.now();
              setPhase("reading");
            }}
            className="w-full max-w-xs"
          >
            Okumaya Başla
          </BigChoice>
        </div>
      </Stage>
    );

  if (phase === "reading")
    return (
      <Stage className="!bg-cream">
        <div className="flex-1 overflow-y-auto">
          <article className="mx-auto max-w-2xl px-5 pb-32 pt-6 sm:px-8">
            <h3 className="mb-4 text-2xl font-extrabold sm:text-3xl">{text.title}</h3>
            {text.body.split(/\n\n+/).map((p, i) => (
              <p key={i} className="read-text mb-4 font-medium text-ink" style={RS(20, 1.75)}>
                {p}
              </p>
            ))}
          </article>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-cream via-cream/95 to-transparent px-4 pb-5 pt-10">
          <BigChoice
            color="carrot"
            className="w-full max-w-sm"
            onClick={() => {
              secs.current = (performance.now() - start.current) / 1000;
              sfx.pop(sound);
              setPhase("quiz");
            }}
          >
            Bitirdim ✓
          </BigChoice>
        </div>
      </Stage>
    );

  return (
    <Stage>
      <Quiz
        questions={text.questions}
        sound={sound}
        title="Metni hatırla – geri dönüş yok"
        onDone={(correct) => {
          const comp = text.questions.length ? correct / text.questions.length : 0;
          const seconds = Math.max(1, secs.current);
          const wpm = Math.round(words / (seconds / 60));
          const ers = Math.round(wpm * comp);
          onFinish({
            score: Math.round(comp * 100),
            nextLevel: level,
            perf: { reading: Math.max(1, ers) },
            metrics: { wpm, comprehension: Math.round(comp * 100), seconds: Math.round(seconds), words },
            summary: `${wpm} kelime/dk · anlama %${Math.round(comp * 100)} · etkili hız ${ers}`,
            highlights: [
              { label: "Okuma hızı", value: `${wpm} k/dk` },
              { label: "Anlama", value: `%${Math.round(comp * 100)}` },
              { label: "Etkili okuma hızı", value: `${ers} k/dk` },
              { label: "Süre", value: `${Math.floor(seconds / 60)} dk ${Math.round(seconds % 60)} sn` },
            ],
            reading: { textId: text.id, words, seconds, wpm, comprehension: comp, kind: "retest" },
          });
        }}
      />
    </Stage>
  );
}

/* ============================================================
   Rehberli Okuma – line pacer
   ============================================================ */
interface Line {
  top: number;
  left: number;
  width: number;
  height: number;
  words: number;
  first: number;
  last: number;
}

export function RehberliOkuma({ wpm, seed, sound, level, onFinish, customText }: GameProps) {
  const text = useMemo(() => practiceText(seed, customText), [seed, customText]);
  const tokens = useMemo(() => text.body.split(/\s+/).filter(Boolean), [text]);
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [li, setLi] = useState(-1);
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const t = useTimers();
  const startAt = useRef(0);
  const secs = useRef(0);

  useLayoutEffect(() => {
    function measure() {
      const box = boxRef.current;
      if (!box) return;
      const spans = Array.from(box.querySelectorAll<HTMLSpanElement>("span[data-w]"));
      const base = box.getBoundingClientRect();
      const out: Line[] = [];
      spans.forEach((s, i) => {
        // measure relative to the box the band is positioned in (independent of offsetParent)
        const r = s.getBoundingClientRect();
        const top = r.top - base.top;
        const left = r.left - base.left;
        const cur = out[out.length - 1];
        if (!cur || Math.abs(cur.top - top) > 4) {
          out.push({ top, left, width: r.width, height: r.height, words: 1, first: i, last: i });
        } else {
          cur.width = left + r.width - cur.left;
          cur.words += 1;
          cur.last = i;
        }
      });
      setLines(out);
    }
    measure();
    // line breaks change once the web font arrives – measure again then
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tokens]);

  // start once lines are known
  useEffect(() => {
    if (lines.length && li === -1) {
      startAt.current = performance.now();
      setLi(0);
    }
  }, [lines, li]);

  const lineMs = (l?: Line) => (l ? (l.words / wpm) * 60000 : 0);

  useEffect(() => {
    if (li < 0 || phase !== "read") return;
    const l = lines[li];
    if (!l) return;
    const sc = scrollRef.current;
    if (sc) sc.scrollTo({ top: Math.max(0, l.top - sc.clientHeight * 0.35), behavior: "smooth" });
    const id = t.after(() => {
      if (li + 1 >= lines.length) {
        secs.current = (performance.now() - startAt.current) / 1000;
        sfx.pop(sound);
        if (customText) onFinish(practiceOutcome(text, wpm, secs.current, 0, level, "kendi-metni"));
        else setPhase("quiz");
      } else setLi(li + 1);
    }, lineMs(l));
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [li, lines, phase]);

  if (phase === "quiz")
    return (
      <Stage>
        <Quiz
          questions={text.questions}
          sound={sound}
          onDone={(c) => onFinish(practiceOutcome(text, wpm, secs.current, c, level, "rehberli"))}
        />
      </Stage>
    );

  const cur = lines[li];
  const curLast = cur?.last ?? -1;
  // line index of every word – used by the optional "renkli satırlar" setting
  const lineOf: number[] = [];
  lines.forEach((l, k) => {
    for (let w = l.first; w <= l.last; w++) lineOf[w] = k;
  });
  const progress = lines.length ? Math.max(0, li) / lines.length : 0;
  return (
    <Stage className="!bg-cream">
      <Hud left={<Pill tone="brand">📖 {text.title}</Pill>} right={<Pill tone="carrot">⚡ {wpm} k/dk</Pill>} progress={progress} />
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div ref={boxRef} className="relative mx-auto max-w-2xl px-5 pb-[45vh] pt-[18vh] sm:px-8">
          {cur && (
            <div
              className="pointer-events-none absolute rounded-lg bg-brand-soft"
              style={{ top: cur.top - 4, left: cur.left - 8, width: cur.width + 16, height: cur.height + 8, transition: "top .18s ease-out" }}
            >
              <div
                key={li}
                className="absolute bottom-0 left-0 h-[3px] rounded-full bg-carrot text-night"
                style={{ width: "100%", animation: `pacer ${lineMs(cur)}ms linear both` }}
              />
            </div>
          )}
          <p className="read-text relative font-medium" style={RS(21, 2.1)}>
            {tokens.map((w, i) => (
              <span key={i} data-w="" className={`transition-opacity duration-300 cl-${(lineOf[i] ?? 0) % 3}`} style={{ opacity: i <= curLast ? (cur && i >= cur.first ? 1 : 0.28) : 1 }}>
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
      <style>{`@keyframes pacer{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1);transform-origin:left}}`}</style>
    </Stage>
  );
}

/* ============================================================
   Blok Okuma – RSVP in meaningful chunks
   ============================================================ */
export function BlokOkuma({ wpm, seed, sound, level, onFinish, customText }: GameProps) {
  const text = useMemo(() => practiceText(seed + 3, customText), [seed, customText]);
  const size = level <= 3 ? 2 : level <= 8 ? 3 : 4;
  const chunks = useMemo(() => {
    const ws = text.body.split(/\s+/).filter(Boolean);
    const out: string[][] = [];
    let cur: string[] = [];
    for (const w of ws) {
      cur.push(w);
      if (cur.length >= size || /[.,;:!?]$/.test(w)) {
        out.push(cur);
        cur = [];
      }
    }
    if (cur.length) out.push(cur);
    return out;
  }, [text, size]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const t = useTimers();
  const startAt = useRef(performance.now());
  const secs = useRef(0);

  useEffect(() => {
    if (phase !== "read") return;
    const c = chunks[i];
    if (!c) return;
    let d = (c.length / wpm) * 60000;
    if (/[.!?]$/.test(c[c.length - 1])) d *= 1.35;
    const id = t.after(() => {
      if (i + 1 >= chunks.length) {
        secs.current = (performance.now() - startAt.current) / 1000;
        sfx.pop(sound);
        if (customText) onFinish(practiceOutcome(text, wpm, secs.current, 0, level, "kendi-metni"));
        else setPhase("quiz");
      } else setI(i + 1);
    }, d);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, phase]);

  if (phase === "quiz")
    return (
      <Stage>
        <Quiz questions={text.questions} sound={sound} onDone={(c) => onFinish(practiceOutcome(text, wpm, secs.current, c, level, "blok"))} />
      </Stage>
    );

  return (
    <Stage>
      <Hud left={<Pill tone="brand">🧱 {text.title}</Pill>} right={<Pill tone="carrot">⚡ {wpm} k/dk · {size} kelime</Pill>} progress={i / chunks.length} />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative flex h-56 w-full max-w-3xl items-center justify-center rounded-[28px] border border-line bg-surface shadow-card">
          <span className="absolute left-1/2 top-0 h-6 w-0.5 -translate-x-1/2 bg-carrot text-night" />
          <span className="absolute bottom-0 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-carrot text-night" />
          <span className="no-select px-4 text-center font-bold tracking-wide text-ink" style={{ fontFamily: "var(--read-font)", fontSize: "calc(clamp(26px, 5.5vw, 52px) * var(--read-scale))" }}>
            {chunks[i]?.join(" ")}
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   Gölgeli Okuma – shaded groups in a narrow column
   ============================================================ */
export function GolgeOkuma({ wpm, seed, sound, level, onFinish, customText }: GameProps) {
  const text = useMemo(() => practiceText(seed + 7, customText), [seed, customText]);
  const size = level <= 4 ? 2 : 3;
  const groups = useMemo(() => {
    const ws = text.body.split(/\s+/).filter(Boolean);
    const out: string[][] = [];
    for (let k = 0; k < ws.length; k += size) out.push(ws.slice(k, k + size));
    return out;
  }, [text, size]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const t = useTimers();
  const startAt = useRef(performance.now());
  const secs = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (phase !== "read") return;
    const sc = scrollRef.current;
    const el = curRef.current;
    if (sc && el) {
      const target = el.offsetTop - sc.clientHeight * 0.4;
      if (Math.abs(sc.scrollTop - target) > 30) sc.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
    const g = groups[i];
    if (!g) return;
    let d = (g.length / wpm) * 60000;
    if (/[.!?]$/.test(g[g.length - 1])) d *= 1.25;
    const id = t.after(() => {
      if (i + 1 >= groups.length) {
        secs.current = (performance.now() - startAt.current) / 1000;
        sfx.pop(sound);
        if (customText) onFinish(practiceOutcome(text, wpm, secs.current, 0, level, "kendi-metni"));
        else setPhase("quiz");
      } else setI(i + 1);
    }, d);
    return () => t.clear(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, phase]);

  if (phase === "quiz")
    return (
      <Stage>
        <Quiz questions={text.questions} sound={sound} onDone={(c) => onFinish(practiceOutcome(text, wpm, secs.current, c, level, "golge"))} />
      </Stage>
    );

  return (
    <Stage className="!bg-deep-3 text-white">
      <Hud dark left={<Pill tone="dark">🌗 {text.title}</Pill>} right={<Pill tone="dark">⚡ {wpm} k/dk</Pill>} progress={i / groups.length} />
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="relative mx-auto max-w-[360px] px-5 pb-[50vh] pt-[30vh]">
          <p className="read-text font-semibold" style={RS(21, 2.05)}>
            {groups.map((g, k) => (
              <span
                key={k}
                ref={k === i ? curRef : undefined}
                className="rounded-md px-0.5 transition-all duration-150"
                style={{
                  color: k === i ? "#0A1128" : k < i ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.24)",
                  background: k === i ? "#19E3F9" : "transparent",
                  boxShadow: k === i ? "0 0 0 4px #19E3F9" : "none",
                }}
              >
                {g.join(" ")}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </Stage>
  );
}
