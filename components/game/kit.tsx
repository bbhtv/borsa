"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Domain } from "@/lib/types";
import type { ReadingPayload } from "@/lib/engine";

/* ======================= types ======================= */
export interface GameProps {
  level: number;
  /** automatic reading pace – derived from the measured reading speed */
  wpm: number;
  sound: boolean;
  /** number of reading tests already taken – picks the next test text */
  testsTaken: number;
  /** changes every play – used to pick practice texts */
  seed: number;
  onFinish: (o: GameOutcome) => void;
}

export interface GameOutcome {
  score: number;
  nextLevel: number;
  perf: Partial<Record<Domain | "reading", number>>;
  metrics: Record<string, number | string>;
  summary: string;
  highlights: { label: string; value: string }[];
  reading?: ReadingPayload;
}

/* ======================= math helpers ======================= */
export const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
export const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export const pct = (x: number) => `%${Math.round(x * 100)}`;
export const ms = (x: number) => `${Math.round(x)} ms`;
export const r2 = (x: number) => Math.round(x * 100) / 100;

/** Beat interval derived from the student's automatic reading pace. */
export function beatMs(wpm: number, level: number, wordsPerBeat = 2.2, min = 360, max = 1150) {
  const base = 60000 / Math.max(60, wpm / wordsPerBeat);
  return clamp(base * Math.pow(0.97, level - 1), min, max);
}

/* ======================= sound ======================= */
let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}
export function tone(freq: number, dur = 0.08, type: OscillatorType = "sine", vol = 0.15) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + dur + 0.02);
}
export const sfx = {
  tick: (on: boolean, accent = false) => on && tone(accent ? 1320 : 990, 0.04, "square", 0.06),
  good: (on: boolean) => {
    if (!on) return;
    tone(660, 0.08, "sine", 0.12);
    setTimeout(() => tone(990, 0.1, "sine", 0.12), 70);
  },
  bad: (on: boolean) => on && tone(180, 0.18, "sawtooth", 0.08),
  pop: (on: boolean) => on && tone(520, 0.05, "triangle", 0.12),
  done: (on: boolean) => {
    if (!on) return;
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.14, "sine", 0.12), i * 110));
  },
};
/** must be called from a user gesture once so iOS unlocks audio */
export function unlockAudio() {
  audio();
}

/* ======================= hooks ======================= */
export function useLatest<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}

/** Clears every timeout/interval created through it when the component unmounts. */
export function useTimers() {
  const ids = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const ints = useRef<Set<ReturnType<typeof setInterval>>>(new Set());
  useEffect(() => {
    const t = ids.current;
    const i = ints.current;
    return () => {
      t.forEach(clearTimeout);
      i.forEach(clearInterval);
    };
  }, []);
  const after = useCallback((fn: () => void, msDelay: number) => {
    const id = setTimeout(() => {
      ids.current.delete(id);
      fn();
    }, msDelay);
    ids.current.add(id);
    return id;
  }, []);
  const every = useCallback((fn: () => void, msDelay: number) => {
    const id = setInterval(fn, msDelay);
    ints.current.add(id);
    return id;
  }, []);
  const clear = useCallback((id?: ReturnType<typeof setTimeout>) => {
    if (id == null) return;
    clearTimeout(id);
    clearInterval(id);
    ids.current.delete(id);
    ints.current.delete(id);
  }, []);
  const clearAll = useCallback(() => {
    ids.current.forEach(clearTimeout);
    ints.current.forEach(clearInterval);
    ids.current.clear();
    ints.current.clear();
  }, []);
  return { after, every, clear, clearAll };
}

/** Seconds-left countdown; calls onEnd once. */
export function useCountdown(totalSec: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(totalSec);
  const end = useLatest(onEnd);
  const startRef = useRef<number | null>(null);
  const fired = useRef(false);
  useEffect(() => {
    if (!running) return;
    if (startRef.current == null) startRef.current = performance.now();
    const id = setInterval(() => {
      const el = (performance.now() - (startRef.current || 0)) / 1000;
      const l = Math.max(0, totalSec - el);
      setLeft(l);
      if (l <= 0 && !fired.current) {
        fired.current = true;
        clearInterval(id);
        end.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, totalSec, end]);
  return left;
}

export function useKeys(handler: (e: KeyboardEvent) => void, active = true) {
  const h = useLatest(handler);
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      h.current(e);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, h]);
}

export function useStageSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/* ======================= UI pieces ======================= */
export function Hud({
  left,
  right,
  progress,
  dark,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  progress?: number;
  dark?: boolean;
}) {
  return (
    <div className="w-full shrink-0 px-4 pt-3 sm:px-6">
      <div className={`flex items-center justify-between gap-3 text-sm font-extrabold ${dark ? "text-white/85" : "text-slate"}`}>
        <div className="flex min-w-0 items-center gap-2">{left}</div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      {progress != null && (
        <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-line"}`}>
          <div className="h-full rounded-full bg-brand transition-[width] duration-200 ease-linear" style={{ width: `${clamp(progress, 0, 1) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

export function Pill({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" | "brand" | "carrot" }) {
  const cls =
    tone === "dark"
      ? "bg-white/10 text-white"
      : tone === "brand"
        ? "bg-brand-soft text-deep"
        : tone === "carrot"
          ? "bg-peach text-ink"
          : "bg-white text-ink border border-line";
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ${cls}`}>{children}</span>;
}

export function TimeLeft({ left, dark }: { left: number; dark?: boolean }) {
  return <Pill tone={dark ? "dark" : "light"}>⏱ {Math.ceil(left)} sn</Pill>;
}

export function BigChoice({
  children,
  onClick,
  color = "brand",
  kbd,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: "brand" | "carrot" | "grape" | "white" | "deep";
  kbd?: string;
  disabled?: boolean;
  className?: string;
}) {
  const map = {
    brand: "bg-brand text-white shadow-[0_6px_0_#07879B]",
    carrot: "bg-carrot text-ink shadow-[0_6px_0_#E07B00]",
    grape: "bg-grape text-white shadow-[0_6px_0_#5233C4]",
    white: "bg-white text-ink border border-line shadow-[0_6px_0_#CBD5D1]",
    deep: "bg-deep text-white shadow-[0_6px_0_#06222C]",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={`btn-3d no-select relative flex min-h-16 items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-extrabold active:translate-y-1 active:shadow-none disabled:opacity-40 ${map[color]} ${className}`}
    >
      {children}
      {kbd && <span className="absolute right-2 top-2 hidden rounded-md bg-black/15 px-1.5 text-[10px] font-bold sm:block">{kbd}</span>}
    </button>
  );
}

/** Numeric keypad that also listens to the physical keyboard. */
export function Keypad({
  value,
  onChange,
  onSubmit,
  maxLen = 6,
  allowNegative,
  dark,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  maxLen?: number;
  allowNegative?: boolean;
  dark?: boolean;
}) {
  const v = useLatest(value);
  const press = useCallback(
    (k: string) => {
      const cur = v.current;
      if (k === "⌫") onChange(cur.slice(0, -1));
      else if (k === "OK") onSubmit();
      else if (k === "−") {
        if (allowNegative) onChange(cur.startsWith("-") ? cur.slice(1) : "-" + cur);
      } else if (cur.replace("-", "").length < maxLen) onChange(cur + k);
    },
    [onChange, onSubmit, maxLen, allowNegative, v]
  );
  useKeys((e) => {
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("⌫");
    else if (e.key === "Enter") press("OK");
    else if (e.key === "-" && allowNegative) press("−");
  });
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", allowNegative ? "−" : "⌫", "0", "OK"];
  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            press(k);
          }}
          className={`no-select h-14 rounded-2xl text-xl font-extrabold transition active:translate-y-0.5 ${
            k === "OK"
              ? "bg-brand text-white shadow-[0_4px_0_#07879B]"
              : dark
                ? "bg-white/10 text-white shadow-[0_4px_0_rgba(0,0,0,.35)]"
                : "border border-line bg-white text-ink shadow-[0_4px_0_#CBD5D1]"
          }`}
        >
          {k === "OK" ? "✓" : k}
        </button>
      ))}
      {allowNegative && (
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            press("⌫");
          }}
          className={`col-span-3 h-10 rounded-xl text-sm font-extrabold ${dark ? "bg-white/5 text-white/80" : "bg-line/60 text-slate"}`}
        >
          ⌫ Sil
        </button>
      )}
    </div>
  );
}

/** Feedback flash overlay */
export function Flash({ kind }: { kind: "good" | "bad" | null }) {
  if (!kind) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 rounded-[inherit] ${kind === "good" ? "bg-emerald-400/15" : "bg-rose-500/20"}`}
      style={{ animation: "fadeUp .25s ease-out reverse both" }}
    />
  );
}

/** Stage wrapper used by all games */
export function Stage({ children, dark, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${dark ? "stage-dark text-white" : "bg-bg text-ink"} ${className}`}>
      {children}
    </div>
  );
}
