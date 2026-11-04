"use client";

import { useMemo, useRef, useState } from "react";
import { levelFactor, nextLevelFrom, speedIndex } from "@/lib/engine";
import { PRACTICE_TEXTS } from "@/content/texts";
import {
  Hud,
  Pill,
  Stage,
  TimeLeft,
  avg,
  clamp,
  pct,
  r2,
  randInt,
  sfx,
  shuffle,
  useCountdown,
  useTimers,
  type GameProps,
} from "@/components/game/kit";

/* ============================================================
   Bilgi Avı – scanning a real text for target words
   ============================================================ */
const norm = (w: string) => w.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]/gu, "");

export function BilgiAvi({ level, seed, sound, onFinish }: GameProps) {
  const DURATION = 75;
  const TARGETS = 8;
  const { words, targets } = useMemo(() => {
    const a = PRACTICE_TEXTS[Math.abs(seed + 2) % PRACTICE_TEXTS.length];
    const b = PRACTICE_TEXTS[Math.abs(seed + 9) % PRACTICE_TEXTS.length];
    const body = level >= 8 ? `${a.body} ${b.body}` : a.body;
    const ws = body.split(/\s+/).filter(Boolean);
    const count = new Map<string, number>();
    ws.forEach((w) => count.set(norm(w), (count.get(norm(w)) || 0) + 1));
    const cands = ws.map((w, i) => ({ i, n: norm(w) })).filter((x) => x.n.length >= 5 && count.get(x.n) === 1);
    return { words: ws, targets: shuffle(cands).slice(0, TARGETS) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [k, setK] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const stats = useRef({ errors: 0, times: [] as number[], last: performance.now(), start: performance.now() });
  const done = useRef(false);
  const t = useTimers();

  function finish() {
    if (done.current) return;
    done.current = true;
    const s = stats.current;
    const hits = s.times.length;
    const acc = hits / Math.max(1, hits + s.errors);
    const mins = Math.max(0.25, (performance.now() - s.start) / 60000);
    const perMin = hits / mins;
    onFinish({
      score: Math.round(clamp((hits / TARGETS) * acc * Math.min(1, perMin / 10 + 0.4), 0, 1) * 100),
      nextLevel: nextLevelFrom(level, hits === TARGETS && acc >= 0.85 ? 0.9 : acc - 0.2),
      perf: { attention: r2(Math.max(0.2, perMin) * acc * levelFactor(level)), reaction: hits ? speedIndex(avg(s.times), Math.max(0.1, acc)) : 0 },
      metrics: { bulunan: hits, hata: s.errors, ortBulma: Math.round(avg(s.times)) },
      summary: `${hits}/${TARGETS} kelime bulundu · ort. ${(avg(s.times) / 1000).toFixed(1)} sn`,
      highlights: [
        { label: "Bulunan", value: `${hits} / ${TARGETS}` },
        { label: "Ort. bulma süresi", value: hits ? `${(avg(s.times) / 1000).toFixed(1)} sn` : "–" },
        { label: "Doğruluk", value: pct(acc) },
      ],
    });
  }
  const left = useCountdown(DURATION, true, finish);

  function tap(i: number) {
    if (done.current || !targets[k]) return;
    if (i === targets[k].i) {
      const now = performance.now();
      stats.current.times.push(now - stats.current.last);
      stats.current.last = now;
      setFound((f) => [...f, i]);
      sfx.good(sound);
      if (k + 1 >= targets.length) t.after(finish, 300);
      else setK(k + 1);
    } else if (!found.includes(i)) {
      stats.current.errors += 1;
      sfx.bad(sound);
      setWrong(i);
      t.after(() => setWrong(null), 300);
    }
  }

  const target = targets[k] ? words[targets[k].i].replace(/[^\p{L}\p{N}]/gu, "") : "";
  return (
    <Stage className="!bg-cream">
      <Hud
        left={
          <span className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate">Bul:</span>
            <span key={k} className="rounded-xl bg-carrot px-3 py-1 text-lg font-extrabold text-night" style={{ animation: "pop .2s both" }}>
              {target}
            </span>
          </span>
        }
        right={
          <>
            <Pill>{found.length} / {targets.length}</Pill>
            <TimeLeft left={left} />
          </>
        }
        progress={found.length / Math.max(1, targets.length)}
      />
      <div className="flex-1 overflow-y-auto">
        <p className="read-text mx-auto max-w-3xl px-5 py-6 font-medium text-ink sm:px-8" style={{ ["--read-base" as string]: "19px", ["--read-lh" as string]: 1.95 }}>
          {words.map((w, i) => (
            <span key={i}>
              <span
                onPointerDown={(e) => {
                  e.preventDefault();
                  tap(i);
                }}
                className={`no-select cursor-pointer rounded px-0.5 transition ${
                  found.includes(i) ? "bg-emerald-500 text-white" : wrong === i ? "shake bg-rose-500/25" : "hover:bg-brand-soft"
                }`}
              >
                {w}
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
    </Stage>
  );
}

/* ============================================================
   Hafıza Kartları – pairs / concentration
   ============================================================ */
const CARD_EMOJI = ["🐰", "🥕", "🦋", "🐝", "🚀", "⭐", "🍎", "🌙", "🎈", "🐢", "🦊", "🐳", "🌵", "🍉"];

export function HafizaKartlari({ level, sound, onFinish }: GameProps) {
  const DURATION = 90;
  const pairs = level <= 3 ? 6 : level <= 8 ? 8 : level <= 13 ? 10 : 12;
  const cols = pairs <= 6 ? 4 : pairs <= 8 ? 4 : pairs <= 10 ? 5 : 6;
  const deck = useMemo(() => shuffle(shuffle(CARD_EMOJI).slice(0, pairs).flatMap((e) => [e, e])).map((e, i) => ({ e, i })), [pairs]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const stats = useRef({ moves: 0, start: performance.now() });
  const lock = useRef(false);
  const done = useRef(false);
  const t = useTimers();

  function finish(all: boolean) {
    if (done.current) return;
    done.current = true;
    const s = stats.current;
    const found = all ? pairs : matched.length / 2;
    const eff = s.moves ? found / s.moves : 0;
    const secs = (performance.now() - s.start) / 1000;
    onFinish({
      score: Math.round(clamp(eff * (found / pairs) * 1.15, 0, 1) * 100),
      nextLevel: nextLevelFrom(level, all && eff >= 0.55 ? 0.9 : all ? 0.7 : 0.4),
      perf: { memory: r2(Math.max(0.05, eff) * pairs * levelFactor(level)), attention: r2(Math.max(0.05, eff) * 100) },
      metrics: { cift: pairs, bulunan: found, hamle: s.moves, sure: Math.round(secs) },
      summary: `${found}/${pairs} çift · ${s.moves} hamle`,
      highlights: [
        { label: "Bulunan çift", value: `${found} / ${pairs}` },
        { label: "Hamle", value: String(s.moves) },
        { label: "Verimlilik", value: pct(eff) },
        { label: "Süre", value: `${Math.round(secs)} sn` },
      ],
    });
  }
  const left = useCountdown(DURATION, true, () => finish(false));

  function flip(i: number) {
    if (done.current || lock.current || open.includes(i) || matched.includes(i)) return;
    sfx.pop(sound);
    const o = [...open, i];
    setOpen(o);
    if (o.length < 2) return;
    stats.current.moves += 1;
    lock.current = true;
    const [a, b] = o;
    if (deck[a].e === deck[b].e) {
      const m = [...matched, a, b];
      t.after(() => {
        setMatched(m);
        setOpen([]);
        lock.current = false;
        sfx.good(sound);
        if (m.length === deck.length) t.after(() => finish(true), 400);
      }, 300);
    } else {
      t.after(() => {
        setOpen([]);
        lock.current = false;
      }, 750);
    }
  }

  return (
    <Stage>
      <Hud left={<Pill tone="brand">🃏 {matched.length / 2} / {pairs} çift · {stats.current.moves} hamle</Pill>} right={<TimeLeft left={left} />} progress={1 - left / DURATION} />
      <div className="flex flex-1 items-center justify-center p-3 sm:p-6">
        <div className="grid w-full gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, maxWidth: `min(${cols * 120}px, calc((100vh - 220px) * ${cols} / ${Math.ceil(deck.length / cols)}))` }}>
          {deck.map((c) => {
            const shown = open.includes(c.i) || matched.includes(c.i);
            return (
              <button
                key={c.i}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  flip(c.i);
                }}
                className="no-select aspect-[3/4] [perspective:600px]"
              >
                <span
                  className="relative block h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
                  style={{ transform: shown ? "rotateY(180deg)" : "none" }}
                >
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-deep-2 text-2xl text-white/80 shadow-card [backface-visibility:hidden]">
                    🐾
                  </span>
                  <span
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl border-2 bg-surface text-4xl shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-5xl ${matched.includes(c.i) ? "border-emerald-400" : "border-line"}`}
                  >
                    {c.e}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}

/* ============================================================
   İşaretleme Testi – d2-style selective attention
   ============================================================ */
interface Mark {
  id: number;
  letter: "d" | "p";
  top: number;
  bottom: number;
  target: boolean;
}
function makePage(n: number, base: number): Mark[] {
  const out: Mark[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let letter: "d" | "p" = "d";
    let top = 1;
    let bottom = 1;
    if (r < 0.45) {
      // target: d with exactly two marks
      const split = randInt(0, 2);
      top = split;
      bottom = 2 - split;
    } else if (r < 0.75) {
      letter = "d";
      const total = [1, 3, 4][randInt(0, 2)];
      top = randInt(Math.max(0, total - 2), Math.min(2, total));
      bottom = total - top;
    } else {
      letter = "p";
      const total = randInt(1, 3);
      top = randInt(Math.max(0, total - 2), Math.min(2, total));
      bottom = total - top;
    }
    out.push({ id: base + i, letter, top, bottom, target: letter === "d" && top + bottom === 2 });
  }
  return out;
}

export function IsaretlemeTesti({ level, sound, onFinish }: GameProps) {
  const PAGES = 3;
  const PER = 36;
  const pageSec = clamp(26 - level, 14, 26);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Mark[]>(() => makePage(PER, 0));
  const [marked, setMarked] = useState<number[]>([]);
  const stats = useRef({ hits: 0, commissions: 0, omissions: 0, targets: 0, seconds: 0 });
  const pageStart = useRef(performance.now());
  const done = useRef(false);

  function endPage() {
    if (done.current) return;
    const s = stats.current;
    const set = new Set(marked);
    for (const it of items) {
      if (it.target) {
        s.targets += 1;
        if (set.has(it.id)) s.hits += 1;
        else s.omissions += 1;
      } else if (set.has(it.id)) s.commissions += 1;
    }
    s.seconds += (performance.now() - pageStart.current) / 1000;
    if (page + 1 >= PAGES) {
      done.current = true;
      const kl = s.hits - s.commissions;
      const acc = s.hits / Math.max(1, s.hits + s.commissions + s.omissions);
      const mins = Math.max(0.2, s.seconds / 60);
      onFinish({
        score: Math.round(clamp(kl / Math.max(1, s.targets), 0, 1) * 100),
        nextLevel: nextLevelFrom(level, acc),
        perf: { attention: r2((Math.max(0.5, kl) / mins) * levelFactor(level)), reaction: r2(Math.max(0.5, s.hits) / mins) },
        metrics: { dogru: s.hits, yanlis: s.commissions, atlanan: s.omissions, konsantrasyon: kl },
        summary: `konsantrasyon puanı ${kl} · ${s.omissions} atlanan`,
        highlights: [
          { label: "Konsantrasyon (KP)", value: String(kl) },
          { label: "Doğru işaret", value: `${s.hits} / ${s.targets}` },
          { label: "Yanlış işaret", value: String(s.commissions) },
          { label: "Atlanan", value: String(s.omissions) },
        ],
      });
      return;
    }
    sfx.good(sound);
    setPage(page + 1);
    setItems(makePage(PER, (page + 1) * PER));
    setMarked([]);
    pageStart.current = performance.now();
  }
  // the countdown restarts for every page (PageTimer is keyed by page)
  return (
    <Stage>
      <Hud
        left={<Pill tone="brand">Yalnızca 2 çizgili <b className="mx-1 text-base">d</b></Pill>}
        right={
          <>
            <Pill>Sayfa {page + 1} / {PAGES}</Pill>
            <PageTimer key={page} sec={pageSec} onEnd={endPage} />
          </>
        }
        progress={page / PAGES}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-3 sm:p-6">
        <div className="grid w-full max-w-4xl grid-cols-6 gap-1.5 sm:grid-cols-12 sm:gap-2">
          {items.map((it) => {
            const on = marked.includes(it.id);
            return (
              <button
                key={it.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  sfx.pop(sound);
                  setMarked((m) => (m.includes(it.id) ? m.filter((x) => x !== it.id) : [...m, it.id]));
                }}
                className={`no-select flex h-20 flex-col items-center justify-center rounded-xl border-2 transition ${on ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
              >
                <Strokes n={it.top} />
                <span className="font-mono text-3xl font-bold leading-none text-ink">{it.letter}</span>
                <Strokes n={it.bottom} />
              </button>
            );
          })}
        </div>
        <button type="button" onClick={endPage} className="rounded-2xl bg-deep px-6 py-3 font-extrabold text-white">
          {page + 1 >= PAGES ? "Bitir" : "Sonraki sayfa →"}
        </button>
      </div>
    </Stage>
  );
}

function Strokes({ n }: { n: number }) {
  return (
    <span className="flex h-3 items-center gap-1">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className="block h-3 w-[3px] rounded bg-ink" />
      ))}
    </span>
  );
}

function PageTimer({ sec, onEnd }: { sec: number; onEnd: () => void }) {
  const left = useCountdown(sec, true, onEnd);
  return <TimeLeft left={left} />;
}

