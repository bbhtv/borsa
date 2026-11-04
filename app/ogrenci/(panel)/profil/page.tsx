"use client";

import { useState } from "react";
import { useStudent } from "@/components/student/StudentContext";
import { PasswordForm, LogoutButton } from "@/components/ui/Account";
import { ThemeSelect } from "@/components/ui/Theme";
import { DEFAULT_READING_PREFS, type ReadingPrefs } from "@/lib/types";

const FONTS: { v: ReadingPrefs["font"]; t: string; css: string }[] = [
  { v: "jakarta", t: "Standart", css: "var(--font-sans)" },
  { v: "lexend", t: "Lexend (akıcı)", css: "var(--font-lexend), sans-serif" },
  { v: "serif", t: "Kitap (serif)", css: "var(--font-literata), Georgia, serif" },
];

export default function Profile() {
  const { data, reload } = useStudent();
  const [saving, setSaving] = useState(false);
  if (!data) return null;
  const prefs = { ...DEFAULT_READING_PREFS, ...data.profile.readingPrefs };

  async function post(body: object) {
    setSaving(true);
    await fetch("/api/student/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await reload();
    setSaving(false);
  }
  const setPref = (p: Partial<ReadingPrefs>) => post({ readingPrefs: p });
  const font = FONTS.find((f) => f.v === prefs.font)!;
  const scale = prefs.size === "xl" ? 1.3 : prefs.size === "l" ? 1.15 : 1;

  return (
    <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
      <section className="flex flex-col gap-3 rounded-[26px] border border-line bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-peach text-3xl">🐰</span>
          <div>
            <div className="text-xl font-extrabold">{data.user.name}</div>
            <div className="text-sm font-bold text-slate">
              @{data.user.username} {data.user.grade ? `· ${data.user.grade}` : ""}
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-bg p-3 text-sm font-bold text-slate">
          Eğitmenin: <span className="text-ink">{data.teacherName || "–"}</span>
        </div>
        <div className="rounded-2xl bg-bg p-3 text-sm font-bold text-slate">
          Okuma hızın tamamen otomatik ayarlanır. Haftada bir yapılan ölçüm ve egzersizlerdeki anlama başarın hızını belirler.
        </div>
        <h3 className="mt-2 text-sm font-extrabold uppercase tracking-widest text-muted">Görünüm</h3>
        <ThemeSelect />
        <button type="button" disabled={saving} onClick={() => post({ sound: !data.profile.sound })} className="flex items-center justify-between rounded-2xl border-2 border-line px-4 py-3 font-extrabold">
          <span>🔊 Ses efektleri & metronom</span>
          <Toggle on={data.profile.sound} />
        </button>
        <LogoutButton />
      </section>

      <section className="flex flex-col gap-4 rounded-[26px] border border-line bg-surface p-5 shadow-card">
        <div>
          <h3 className="text-lg font-extrabold">📖 Okuma ayarları</h3>
          <p className="text-sm font-semibold text-slate">Tüm okuma egzersizlerinde ve Okuma Odası’nda kullanılır.</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Yazı tipi</span>
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map((f) => (
              <button key={f.v} type="button" disabled={saving} onClick={() => setPref({ font: f.v })} className={`rounded-2xl border-2 px-2 py-3 text-sm font-bold ${prefs.font === f.v ? "border-brand bg-brand-soft" : "border-line"}`} style={{ fontFamily: f.css }}>
                {f.t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Yazı boyutu</span>
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-bg p-1">
              {(["m", "l", "xl"] as const).map((v, i) => (
                <button key={v} type="button" disabled={saving} onClick={() => setPref({ size: v })} className={`rounded-xl py-2 font-extrabold ${prefs.size === v ? "bg-surface shadow-card" : "text-slate"}`} style={{ fontSize: 13 + i * 3 }}>
                  A
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Satır aralığı</span>
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-bg p-1">
              {(["normal", "wide"] as const).map((v) => (
                <button key={v} type="button" disabled={saving} onClick={() => setPref({ spacing: v })} className={`rounded-xl py-2 text-sm font-extrabold ${prefs.spacing === v ? "bg-surface shadow-card" : "text-slate"}`}>
                  {v === "normal" ? "Normal" : "Geniş"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button type="button" disabled={saving} onClick={() => setPref({ colorLines: !prefs.colorLines })} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-line px-4 py-3 text-left font-extrabold">
          <span>
            🌈 Renkli satırlar
            <span className="block text-xs font-semibold text-muted">Rehberli okumada satırlar sırayla renklenir; satır sonundan yenisine geçişi kolaylaştırır.</span>
          </span>
          <Toggle on={prefs.colorLines} />
        </button>
        <div className="rounded-2xl bg-cream p-4">
          <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Önizleme</span>
          <p className={prefs.colorLines ? "color-lines" : ""} style={{ fontFamily: font.css, fontSize: 18 * scale, lineHeight: 1.9 * (prefs.spacing === "wide" ? 1.15 : 1) }}>
            <span className="cl-0 block">Kuşlar yollarını bulmak için güneşin konumunu,</span>
            <span className="cl-1 block">yıldızları ve dünyanın manyetik alanını kullanır.</span>
            <span className="cl-2 block">Leylekler sıcak hava akımlarında süzülür.</span>
          </p>
        </div>
      </section>
      <div className="lg:col-span-2 lg:max-w-xl">
        <PasswordForm />
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-line"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
    </span>
  );
}
