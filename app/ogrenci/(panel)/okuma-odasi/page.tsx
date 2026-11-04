"use client";

import { useEffect, useMemo, useState } from "react";
import { useStudent } from "@/components/student/StudentContext";
import { FreeReader, type FreeMode } from "@/components/player/FreeReader";
import { PRACTICE_TEXTS, wordCount } from "@/content/texts";

const MODES: { id: FreeMode; t: string; d: string; e: string }[] = [
  { id: "rehberli", t: "Rehberli", d: "Satır satır ışık bandı", e: "📖" },
  { id: "blok", t: "Blok", d: "2–4 kelimelik öbekler", e: "🧱" },
  { id: "golge", t: "Gölgeli", d: "Dar sütun, aydınlanan gruplar", e: "🌗" },
];

const WPP = [
  { v: 150, t: "Çocuk kitabı" },
  { v: 250, t: "Roman / hikâye" },
  { v: 320, t: "Ders kitabı" },
];

const TIMER_KEY = "tvs-book-timer";

export default function ReadingRoom() {
  const { data, reload } = useStudent();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<FreeMode>("rehberli");
  const [reading, setReading] = useState(false);
  if (!data) return null;
  const words = wordCount(body);
  const ok = words >= 20 && words <= 4000;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* ---------- own text ---------- */}
        <div className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-5 shadow-card">
          <div>
            <h2 className="text-xl font-extrabold">📝 Kendi metnini oku</h2>
            <p className="text-sm font-semibold text-slate">
              Ders kitabından, bir makaleden ya da hikâyeden metni yapıştır; senin otomatik antrenman hızında ({data.profile.trainingWpm} k/dk) okut.
            </p>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (isteğe bağlı)" className="rounded-2xl border-2 border-line bg-bg px-4 py-3 font-bold outline-none focus:border-brand" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            placeholder="Metni buraya yapıştır…"
            className="resize-y rounded-2xl border-2 border-line bg-bg px-4 py-3 font-medium leading-relaxed outline-none focus:border-brand"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
            <span>{words} kelime</span>
            {words > 4000 && <span className="text-rose-600 dark:text-rose-300">· en fazla 4000 kelime</span>}
            <button
              type="button"
              onClick={() => {
                const t = PRACTICE_TEXTS[Math.floor(Math.random() * PRACTICE_TEXTS.length)];
                setTitle(t.title);
                setBody(t.body);
              }}
              className="ml-auto rounded-full bg-bg px-3 py-1 text-xs font-extrabold text-ink ring-1 ring-line hover:ring-brand"
            >
              Örnek metin ekle
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-3 text-center transition ${mode === m.id ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50"}`}
              >
                <span className="text-2xl">{m.e}</span>
                <span className="text-sm font-extrabold">{m.t}</span>
                <span className="text-[11px] font-bold text-muted">{m.d}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!ok}
            onClick={() => setReading(true)}
            className="btn-3d rounded-[20px] bg-brand py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#07879B] disabled:opacity-40"
          >
            Okumaya başla →
          </button>
          {data.profile.freeReading?.sessions ? (
            <p className="text-xs font-bold text-muted">
              Şimdiye kadar {data.profile.freeReading.sessions} metin · {data.profile.freeReading.words.toLocaleString("tr-TR")} kelime · {Math.round(data.profile.freeReading.seconds / 60)} dk serbest okuma
            </p>
          ) : null}
        </div>

        {/* ---------- book log ---------- */}
        <BookLog onSaved={reload} />
      </section>

      {reading && (
        <FreeReader
          title={title.trim() || "Kendi metnim"}
          body={body}
          mode={mode}
          profile={data.profile}
          onClose={() => {
            setReading(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function fmt(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function BookLog({ onSaved }: { onSaved: () => Promise<void> }) {
  const { data } = useStudent();
  // timer survives page changes: start time / accumulated seconds live in localStorage
  const [timer, setTimer] = useState<{ startedAt: number | null; acc: number }>({ startedAt: null, acc: 0 });
  const [now, setNow] = useState(Date.now());
  const [book, setBook] = useState("");
  const [pages, setPages] = useState("");
  const [wpp, setWpp] = useState(250);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      if (raw) setTimer(JSON.parse(raw));
    } catch {}
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const save = (t: typeof timer) => {
    setTimer(t);
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify(t));
    } catch {}
  };
  const elapsed = timer.acc + (timer.startedAt ? (now - timer.startedAt) / 1000 : 0);
  const log = data?.profile.bookLog || [];
  const totals = useMemo(
    () => ({ pages: log.reduce((a, b) => a + b.pages, 0), mins: Math.round(log.reduce((a, b) => a + b.seconds, 0) / 60), wpm: log.length ? Math.round(log.slice(0, 5).reduce((a, b) => a + b.wpm, 0) / Math.min(5, log.length)) : null }),
    [log]
  );

  async function submit() {
    setMsg(null);
    const res = await fetch("/api/student/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: book, pages: Number(pages), wordsPerPage: wpp, seconds: Math.round(elapsed) }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg({ ok: false, t: d.error });
    setMsg({ ok: true, t: `Kaydedildi: ${d.entry.wpm} kelime/dk` });
    save({ startedAt: null, acc: 0 });
    setPages("");
    await onSaved();
  }

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-5 shadow-card">
      <div>
        <h2 className="text-xl font-extrabold">📚 Kitap okuma takibi</h2>
        <p className="text-sm font-semibold text-slate">Gerçek kitabını okurken kronometreyi çalıştır. Bitince sayfa sayısını gir; gerçek okuma hızın hesaplansın.</p>
      </div>
      <div className="flex items-center gap-3 rounded-[22px] bg-gradient-to-br from-deep-2 to-deep p-4 text-white">
        <span className="font-mono text-4xl font-extrabold tabular-nums">{fmt(elapsed)}</span>
        <div className="ml-auto flex gap-2">
          {timer.startedAt ? (
            <button type="button" onClick={() => save({ startedAt: null, acc: elapsed })} className="rounded-xl bg-carrot px-4 py-2.5 font-extrabold text-night">
              ⏸ Durdur
            </button>
          ) : (
            <button type="button" onClick={() => save({ startedAt: Date.now(), acc: timer.acc })} className="rounded-xl bg-logo px-4 py-2.5 font-extrabold text-night">
              ▶ {timer.acc ? "Devam" : "Başlat"}
            </button>
          )}
          <button type="button" onClick={() => save({ startedAt: null, acc: 0 })} className="rounded-xl bg-white/10 px-3 py-2.5 font-extrabold" aria-label="Sıfırla">
            ↺
          </button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
        <input value={book} onChange={(e) => setBook(e.target.value)} placeholder="Kitabın adı" className="rounded-2xl border-2 border-line bg-bg px-4 py-3 font-bold outline-none focus:border-brand" />
        <input value={pages} onChange={(e) => setPages(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Sayfa" className="rounded-2xl border-2 border-line bg-bg px-4 py-3 font-bold outline-none focus:border-brand" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {WPP.map((w) => (
          <button key={w.v} type="button" onClick={() => setWpp(w.v)} className={`rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${wpp === w.v ? "bg-brand text-white ring-brand" : "bg-bg ring-line"}`}>
            {w.t} · ~{w.v}
          </button>
        ))}
        <label className="flex items-center gap-1 rounded-full bg-bg px-3 py-1 text-xs font-extrabold ring-1 ring-line">
          <input value={wpp} onChange={(e) => setWpp(Number(e.target.value.replace(/\D/g, "")) || 0)} inputMode="numeric" className="w-12 bg-transparent font-extrabold outline-none" />
          kelime/sayfa
        </label>
      </div>
      <p className="text-[11.5px] font-semibold text-muted">İpucu: Bir sayfadaki 3 dolu satırın kelimelerini say, 3’e böl ve sayfadaki satır sayısıyla çarp.</p>
      <button
        type="button"
        disabled={!pages || elapsed < 30 || !!timer.startedAt}
        onClick={submit}
        className="rounded-2xl bg-grape py-3 font-extrabold text-white disabled:opacity-40"
      >
        {timer.startedAt ? "Kaydetmek için önce durdur" : elapsed < 30 ? "En az 30 sn oku" : "Okumayı kaydet"}
      </button>
      {msg && <p className={`text-sm font-bold ${msg.ok ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>{msg.t}</p>}

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Toplam sayfa", totals.pages],
          ["Toplam süre", `${totals.mins} dk`],
          ["Kitap hızın", totals.wpm ? `${totals.wpm} k/dk` : "–"],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl bg-bg p-2.5">
            <div className="text-lg font-extrabold tabular-nums">{v}</div>
            <div className="text-[11px] font-bold text-muted">{l}</div>
          </div>
        ))}
      </div>
      {log.length > 0 && (
        <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
          {log.slice(0, 20).map((e) => (
            <li key={e.id} className="flex items-center gap-2 rounded-xl bg-bg px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-extrabold">{e.title}</span>
              <span className="font-bold text-slate">{e.pages} s · {Math.round(e.seconds / 60)} dk</span>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-extrabold">{e.wpm} k/dk</span>
              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/student/book?id=${e.id}`, { method: "DELETE" });
                  await onSaved();
                }}
                className="text-xs font-extrabold text-muted hover:text-rose-500"
                aria-label="Sil"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
