"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import type { Assignment, DailyPlan, GameResult, StudentSummary } from "@/lib/types";
import { DomainGrid, ReadingCard, fmtPct } from "@/components/ui/charts";
import { GameTable, ResultList } from "@/components/ui/GameTable";
import { ExerciseCard, ExerciseLibrary } from "@/components/ui/ExerciseLibrary";
import { GAME_MAP } from "@/lib/catalog";
import { levelName } from "@/lib/engine";

type Detail = StudentSummary & { assignments: Assignment[]; results: GameResult[]; plan: DailyPlan | null };

const PRESETS: { t: string; ids: string[] }[] = [
  { t: "Dikkat paketi", ids: ["ok-yagmuru", "renk-tuzagi", "dur-gec", "farkli-olan"] },
  { t: "Hafıza paketi", ids: ["donen-kare", "isik-yolu", "sayi-hafizasi", "hafiza-treni"] },
  { t: "Matematik paketi", ids: ["roket-siralama", "zihinden-hesap", "sayi-zinciri", "hangisi-buyuk"] },
  { t: "Göz & algı paketi", ids: ["sicrayan-tavsan", "kelebek-sayaci", "genisleyen-cerceve", "simsek-kelime", "schulte"] },
  { t: "Okuma ölçümü", ids: ["okuma-testi"] },
];

export default function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const load = useCallback(async () => {
    const res = await fetch(`/api/teacher/students/${id}`, { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) return setErr(j.error);
    setD(j);
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  if (err) return <p className="rounded-2xl bg-white p-6 font-bold text-rose-600">{err}</p>;
  if (!d) return <div className="p-6 font-bold text-muted">Yükleniyor…</div>;
  const p = d.profile;
  const active = d.assignments.filter((a) => a.active);
  const past = d.assignments.filter((a) => !a.active);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/egitmen" className="self-start text-sm font-extrabold text-brand-dark">← Öğrencilerim</Link>
      <section className="flex flex-wrap items-center gap-4 rounded-[28px] border border-line bg-white p-5 shadow-card">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-peach text-4xl">{d.user.demo ? "🧪" : "🐰"}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold">{d.user.name}</h2>
          <p className="text-sm font-bold text-slate">
            @{d.user.username} {d.user.grade ? `· ${d.user.grade}` : ""} · Seviye {p.level} ({levelName(p.level)}) · 🔥 {p.streak} gün · {p.totalExercises} egzersiz · {Math.round(p.totalSeconds / 60)} dk
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-extrabold">Genel gelişim {fmtPct(d.overall)}</span>
          <button onClick={() => setAssignOpen(true)} className="btn-3d rounded-2xl bg-grape px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#5233C4]">
            + Yeni etkinlik ata
          </button>
        </div>
      </section>

      {!p.placementDone && (
        <div className="rounded-2xl bg-peach px-4 py-3 text-sm font-bold ring-1 ring-carrot/40">
          📏 Öğrenci henüz başlangıç okuma testini yapmadı. İlk girişte otomatik olarak test ekranı açılacak.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <ReadingCard reading={d.reading} />
        <section className="flex flex-col gap-3 rounded-[28px] border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Bugünün programı</h3>
            <span className="text-sm font-extrabold text-slate">{d.plan ? `${d.plan.items.filter((i) => i.done).length}/${d.plan.items.length}` : "henüz açılmadı"}</span>
          </div>
          {d.plan ? (
            <div className="flex flex-wrap gap-1.5">
              {d.plan.items.map((it, i) => (
                <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${it.done ? "bg-emerald-100 text-emerald-700" : it.source === "teacher" ? "bg-[#F4F0FF] text-grape" : "bg-bg text-slate"}`}>
                  {GAME_MAP[it.gameId]?.emoji} {GAME_MAP[it.gameId]?.title} {it.done ? `· ${it.score}` : ""}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-muted">Öğrenci bugün giriş yaptığında 12 adımlık program otomatik oluşturulur. Atadığınız etkinlikler programa eklenir.</p>
          )}
          <h4 className="mt-2 text-sm font-extrabold uppercase tracking-wide text-muted">Aktif ödevler</h4>
          {active.length ? (
            active.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-2xl border border-grape/30 bg-[#F8F5FF] p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold">{a.title}</div>
                  <div className="text-xs font-bold text-slate">
                    {a.startDay} başlangıç · {a.days} gün · {a.completions} egzersiz tamamlandı
                  </div>
                  {a.note && <div className="mt-1 text-sm font-semibold text-slate">“{a.note}”</div>}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {a.gameIds.map((g) => (
                      <span key={g} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold ring-1 ring-line">{GAME_MAP[g]?.emoji} {GAME_MAP[g]?.title}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm("Bu ödev kaldırılsın mı?")) return;
                    await fetch(`/api/teacher/students/${id}/assignments?aid=${a.id}`, { method: "DELETE" });
                    load();
                  }}
                  className="rounded-xl px-2 py-1 text-xs font-extrabold text-rose-600 hover:bg-rose-50"
                >
                  Kaldır
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-muted">Aktif ödev yok.</p>
          )}
          {past.length > 0 && <p className="text-xs font-bold text-muted">{past.length} geçmiş ödev</p>}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold">Bilişsel gelişim (başlangıca göre %)</h3>
        <DomainGrid domains={d.domains} history={p.history} />
      </section>
      <div className="grid gap-5 2xl:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-extrabold">Egzersiz bazında</h3>
          <GameTable games={p.games} />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-extrabold">Son oturumlar</h3>
          <ResultList results={d.results.slice(0, 20)} />
        </section>
      </div>
      <StudentSettings id={id} name={d.user.name} grade={d.user.grade} onSaved={load} />
      {assignOpen && <AssignModal id={id} onClose={() => setAssignOpen(false)} onDone={() => { setAssignOpen(false); load(); }} />}
    </div>
  );
}

function AssignModal({ id, onClose, onDone }: { id: string; onClose: () => void; onDone: () => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toggle = (g: string) => setSel((s) => (s.includes(g) ? s.filter((x) => x !== g) : s.length >= 12 ? s : [...s, g]));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-bg shadow-lift sm:rounded-[28px]" style={{ animation: "fadeUp .25s both" }}>
        <div className="flex items-center gap-3 border-b border-line bg-white px-5 py-4">
          <h3 className="text-xl font-extrabold">Yeni etkinlik ata</h3>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-extrabold">{sel.length} seçili</span>
          <button onClick={onClose} className="ml-auto rounded-xl px-3 py-1.5 font-extrabold text-slate hover:bg-bg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.t}
                onClick={() => {
                  setSel(p.ids);
                  if (!title) setTitle(p.t);
                }}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-extrabold hover:border-brand"
              >
                {p.t}
              </button>
            ))}
          </div>
          <ExerciseLibrary
            includeHidden
            render={(gid) => (
              <button key={gid} type="button" onClick={() => toggle(gid)} className="block text-left">
                <ExerciseCard id={gid} selected={sel.includes(gid)} />
              </button>
            )}
          />
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setBusy(true);
            const res = await fetch(`/api/teacher/students/${id}/assignments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: title || "Eğitmen ödevi", note, gameIds: sel, days }),
            });
            const j = await res.json();
            setBusy(false);
            if (!res.ok) return setErr(j.error);
            onDone();
          }}
          className="grid gap-2 border-t border-line bg-white p-4 sm:grid-cols-[1fr_1.4fr_auto_auto]"
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (ör. Hafta 3 dikkat)" className="rounded-2xl border-2 border-line px-3 py-2.5 font-bold outline-none focus:border-brand" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Öğrenciye not (isteğe bağlı)" className="rounded-2xl border-2 border-line px-3 py-2.5 font-bold outline-none focus:border-brand" />
          <label className="flex items-center gap-2 rounded-2xl border-2 border-line px-3 py-2 text-sm font-bold">
            <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.max(1, Math.min(30, parseInt(e.target.value || "1", 10))))} className="w-12 font-extrabold outline-none" />
            gün
          </label>
          <button disabled={busy || !sel.length} className="rounded-2xl bg-grape px-5 py-2.5 font-extrabold text-white disabled:opacity-50">
            {busy ? "Atanıyor…" : "Ata"}
          </button>
          {err && <p className="text-sm font-bold text-rose-600 sm:col-span-4">{err}</p>}
          <p className="text-xs font-semibold text-muted sm:col-span-4">Seçilen egzersizler öğrencinin günlük programına {days} gün boyunca eklenir. Bugünün programı zaten oluştuysa hemen eklenir.</p>
        </form>
      </div>
    </div>
  );
}

function StudentSettings({ id, name, grade, onSaved }: { id: string; name: string; grade?: string; onSaved: () => void }) {
  const [f, setF] = useState({ name, grade: grade || "", password: "" });
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <section className="grid gap-3 rounded-[26px] border border-line bg-white p-5 shadow-card md:grid-cols-[1fr_1fr_1fr_auto]">
      <h3 className="text-lg font-extrabold md:col-span-4">Öğrenci ayarları</h3>
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ad Soyad" className="rounded-2xl border-2 border-line px-3 py-2.5 font-bold outline-none focus:border-brand" />
      <input value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} placeholder="Sınıf" className="rounded-2xl border-2 border-line px-3 py-2.5 font-bold outline-none focus:border-brand" />
      <input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Yeni şifre (boş bırak = değişmez)" className="rounded-2xl border-2 border-line px-3 py-2.5 font-bold outline-none focus:border-brand" />
      <button
        onClick={async () => {
          const body: Record<string, string> = { name: f.name, grade: f.grade };
          if (f.password) body.password = f.password;
          const res = await fetch(`/api/teacher/students/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          const j = await res.json();
          setMsg(res.ok ? "Kaydedildi." : j.error);
          if (res.ok) {
            setF({ ...f, password: "" });
            onSaved();
          }
        }}
        className="rounded-2xl bg-brand px-5 py-2.5 font-extrabold text-white"
      >
        Kaydet
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-4">
        <span className="text-sm font-bold text-slate">{msg}</span>
        <button
          onClick={async () => {
            if (!confirm(`${name} ve tüm verileri silinsin mi? Bu işlem geri alınamaz.`)) return;
            const res = await fetch(`/api/teacher/students/${id}`, { method: "DELETE" });
            if (res.ok) window.location.href = "/egitmen";
          }}
          className="rounded-2xl px-4 py-2 text-sm font-extrabold text-rose-600 hover:bg-rose-50"
        >
          Öğrenciyi sil
        </button>
      </div>
    </section>
  );
}
