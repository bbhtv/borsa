"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "tvs-theme";

function systemDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function apply(pref: ThemePref) {
  const t = pref === "system" ? (systemDark() ? "dark" : "light") : pref;
  document.documentElement.dataset.theme = t;
}

/** Inline script placed in <head> so the right theme is applied before first paint. */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem('${KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  useEffect(() => {
    let p: ThemePref = "system";
    try {
      p = (localStorage.getItem(KEY) as ThemePref) || "system";
    } catch {}
    setPref(p);
    setResolved((document.documentElement.dataset.theme as "light" | "dark") || "light");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => {
      let cur: ThemePref = "system";
      try {
        cur = (localStorage.getItem(KEY) as ThemePref) || "system";
      } catch {}
      if (cur === "system") {
        apply("system");
        setResolved(systemDark() ? "dark" : "light");
      }
    };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const set = useCallback((p: ThemePref) => {
    try {
      localStorage.setItem(KEY, p);
    } catch {}
    apply(p);
    setPref(p);
    setResolved((document.documentElement.dataset.theme as "light" | "dark") || "light");
  }, []);
  return { pref, resolved, set };
}

const Sun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
const Moon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);

export function ThemeToggle({ className = "", withLabel }: { className?: string; withLabel?: boolean }) {
  const { resolved, set } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={() => set(dark ? "light" : "dark")}
      className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl transition ${withLabel ? "px-3 text-[13px] font-extrabold" : "w-10"} ${className}`}
      aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={dark ? "Açık tema" : "Koyu tema"}
    >
      {dark ? <Sun /> : <Moon />}
      {withLabel && <span>{dark ? "Açık tema" : "Koyu tema"}</span>}
    </button>
  );
}

export function ThemeSelect() {
  const { pref, set } = useTheme();
  const opts: [ThemePref, string][] = [
    ["light", "☀️ Açık"],
    ["dark", "🌙 Koyu"],
    ["system", "💻 Sistem"],
  ];
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-bg p-1">
      {opts.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => set(v)}
          className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${pref === v ? "bg-surface text-ink shadow-card" : "text-slate hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
