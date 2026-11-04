"use client";

import { useState } from "react";
import {
  DOMAINS,
  DOMAIN_COLOR,
  DOMAIN_EMOJI,
  DOMAIN_LABEL,
  type DomainReport,
  type DomainSnapshot,
  type ReadingReport,
} from "@/lib/types";

export function fmtPct(v: number | null | undefined, digits = 1) {
  if (v == null) return "–";
  const s = (Math.round(v * 10 ** digits) / 10 ** digits).toLocaleString("tr-TR");
  return `${v > 0 ? "+" : ""}%${s.replace("-", "−")}`;
}

/* ---------------- single-series line chart with hover ---------------- */
export function LineChart({
  data,
  color = "#0AA5BC",
  height = 180,
  format = (v: number) => String(Math.round(v)),
  unit = "",
  baseline,
}: {
  data: { label: string; value: number; sub?: string }[];
  color?: string;
  height?: number;
  format?: (v: number) => string;
  unit?: string;
  baseline?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const P = { l: 40, r: 16, t: 16, b: 26 };
  if (!data.length) return <div className="flex items-center justify-center rounded-2xl bg-bg text-sm font-bold text-muted" style={{ height }}>Henüz veri yok</div>;
  const vals = data.map((d) => d.value).concat(baseline != null ? [baseline] : []);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) {
    min -= 10;
    max += 10;
  }
  const pad = (max - min) * 0.15;
  min = Math.max(0, min - pad);
  max = max + pad;
  const x = (i: number) => P.l + (data.length === 1 ? (W - P.l - P.r) / 2 : (i / (data.length - 1)) * (W - P.l - P.r));
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const ticks = [min, (min + max) / 2, max];
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const h = hover != null ? data[hover] : null;
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`g${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.18" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#E2EAEC" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fontWeight="700" fill="#64748B">
              {format(t)}
            </text>
          </g>
        ))}
        {baseline != null && (
          <line x1={P.l} x2={W - P.r} y1={y(baseline)} y2={y(baseline)} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        )}
        <path d={area} fill={`url(#g${color.slice(1)})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="#0A1128" strokeOpacity=".25" vectorEffect="non-scaling-stroke" />}
        {data.map((d, i) => (
          <g key={i}>
            <rect x={x(i) - (W / data.length) / 2} y={0} width={W / Math.max(1, data.length)} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
          </g>
        ))}
        {data.length <= 12 &&
          data.map((d, i) => (
            <text key={`l${i}`} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#64748B">
              {d.label}
            </text>
          ))}
      </svg>
      {/* markers in HTML so they stay round with preserveAspectRatio=none */}
      <div className="pointer-events-none absolute inset-0">
        {data.map((d, i) => (
          <span
            key={i}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{ left: `${(x(i) / W) * 100}%`, top: `${(y(d.value) / H) * 100}%`, background: color, transform: `translate(-50%,-50%) scale(${hover === i ? 1.5 : 1})` }}
          />
        ))}
        {h && hover != null && (
          <div
            className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white shadow-lift"
            style={{ left: `${Math.min(85, Math.max(15, (x(hover) / W) * 100))}%`, top: 0 }}
          >
            <div className="text-white/60">{h.label}</div>
            <div className="text-sm">
              {format(h.value)}
              {unit}
            </div>
            {h.sub && <div className="text-white/60">{h.sub}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- sparkline ---------------- */
export function Sparkline({ values, color, height = 34 }: { values: number[]; color: string; height?: number }) {
  if (values.length < 2) return <div style={{ height }} />;
  const W = 120;
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${height - 3 - ((v - min) / (max - min || 1)) * (height - 6)}`).join(" ");
  const zeroY = height - 3 - ((0 - min) / (max - min || 1)) * (height - 6);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="#E2EAEC" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------------- progress ring ---------------- */
export function ProgressRing({ value, size = 96, stroke = 12, color = "#FF9F1C", track = "#FFE8C2", children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode }) {
  const r = (100 - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))} style={{ transition: "stroke-dashoffset .8s" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </span>
  );
}

/* ---------------- the four domains ---------------- */
export function DomainGrid({ domains, history, compact }: { domains: DomainReport[]; history: DomainSnapshot[]; compact?: boolean }) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"}`}>
      {DOMAINS.map((d) => {
        const r = domains.find((x) => x.domain === d);
        const v = r?.improvement ?? null;
        const series = history.map((h) => h.values[d]).filter((x): x is number => typeof x === "number");
        const width = v == null ? 0 : Math.min(100, Math.abs(v));
        return (
          <div key={d} className="flex flex-col gap-2 rounded-[22px] border border-line bg-white p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: DOMAIN_COLOR[d] + "1F" }}>
                {DOMAIN_EMOJI[d]}
              </span>
              <span className="text-[13.5px] font-extrabold leading-tight">{DOMAIN_LABEL[d]}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-extrabold tabular-nums ${compact ? "text-2xl" : "text-3xl"} ${v != null && v < 0 ? "text-carrot-dark" : "text-ink"}`}>
                {v == null ? "Ölçülüyor" : fmtPct(v)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: DOMAIN_COLOR[d] }} />
            </div>
            {!compact && <Sparkline values={series} color={DOMAIN_COLOR[d]} />}
            <span className="text-[11.5px] font-bold text-muted">
              {r?.sessions ? `${r.sessions} oturum · başlangıca göre` : "İlk oturumdan sonra hesaplanır"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- reading summary ---------------- */
export function ReadingCard({ reading, dark }: { reading: ReadingReport; dark?: boolean }) {
  const tests = reading.tests;
  return (
    <div className={`flex flex-col gap-4 rounded-[28px] p-5 shadow-card ${dark ? "bg-gradient-to-br from-deep-2 to-deep text-white" : "border border-line bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-extrabold">📖 Okuma Hızı</span>
        {reading.wpmChange != null && (
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${dark ? "bg-logo text-ink" : "bg-brand-soft text-ink"}`}>{fmtPct(reading.wpmChange)} hız</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Başlangıç", reading.baselineWpm, "kelime/dk"],
          ["Şu an", reading.currentWpm, "kelime/dk"],
          ["Etkili hız", reading.currentErs, "hız × anlama"],
        ].map(([l, v, u]) => (
          <div key={l as string} className={`rounded-2xl p-3 ${dark ? "bg-white/10" : "bg-bg"}`}>
            <div className={`text-[11px] font-bold ${dark ? "text-logo/80" : "text-muted"}`}>{l}</div>
            <div className="text-2xl font-extrabold tabular-nums">{v ?? "–"}</div>
            <div className={`text-[10.5px] font-bold ${dark ? "text-white/60" : "text-muted"}`}>{u}</div>
          </div>
        ))}
      </div>
      {tests.length > 0 && (
        <div className={dark ? "rounded-2xl bg-white p-2" : ""}>
          <LineChart
            height={150}
            color="#0AA5BC"
            unit=" k/dk"
            baseline={reading.baselineWpm ?? undefined}
            data={tests.map((t) => ({
              label: new Date(t.at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
              value: t.wpm,
              sub: `anlama %${Math.round(t.comprehension * 100)} · etkili ${t.ers}`,
            }))}
          />
        </div>
      )}
      <div className={`flex flex-wrap gap-2 text-xs font-bold ${dark ? "text-white/70" : "text-slate"}`}>
        <span>Anlama: {reading.currentComp != null ? `%${Math.round(reading.currentComp * 100)}` : "–"}</span>
        <span>·</span>
        <span>Antrenman hızı: {reading.trainingWpm} k/dk (otomatik)</span>
        {reading.ersChange != null && (
          <>
            <span>·</span>
            <span>Etkili hız değişimi: {fmtPct(reading.ersChange)}</span>
          </>
        )}
      </div>
    </div>
  );
}
