"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { StudentSummary } from "@/lib/types";
import { DOMAINS, DOMAIN_EMOJI, DOMAIN_SHORT } from "@/lib/types";
import { fmtPct } from "@/components/ui/charts";
import { dayKey } from "@/lib/engine";

export default function TeacherHome() {
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [persistent, setPersistent] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/students", { cache: "no-store" });
    if (res.status === 401) return void (window.location.href = "/giris");
    const d = await res.json();
    setStudents(d.students);
    setPersistent(d.persistent);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!students) return <div className="p-6 font-bold text-muted">Yükleniyor…</div>;
  const today = dayKey();
  const activeToday = students.filter((s) => s.profile.lastActiveDay === today).length;
  const changes = students.map((s) => s.reading.wpmChange).filter((x): x is number => x != null);
  const avgChange = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : null;
  const list = students.filter((s) => (s.user.name + s.user.username).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col gap-5">
      {!persistent && (
        <div className="rounded-2xl bg-peach px-4 py-3 text-sm font-bold ring-1 ring-carrot/40">
          ⚠️ Kalıcı veritabanı bağlı değil. Vercel projesine Upstash Redis (KV) ekleyin; aksi halde veriler kaybolabilir.
        </div>
      )}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Öğrenci", String(students.length), "👥"],
          ["Bugün çalışan", `${activeToday}`, "🔥"],
          ["Ort. hız artışı", fmtPct(avgChange), "⚡"],
          ["Ölçüm bekleyen", String(students.filter((s) => !s.profile.placementDone).length), "📏"],
        ].map(([l, v, e]) => (
          <div key={l} className="flex items-center gap-3 rounded-[22px] border border-line bg-white p-4 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-xl">{e}</span>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">{v}</div>
              <div className="text-xs font-bold text-muted">{l}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Öğrenci ara…" className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-4 py-3 font-bold outline-none focus:border-brand sm:max-w-xs" />
        <button onClick={() => setOpen(true)} className="btn-3d ml-auto rounded-2xl bg-brand px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#07879B]">
          + Öğrenci ekle
        </button>
      </div>

      <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((s) => {
          const r = s.reading;
          return (
            <Link key={s.user.id} href={`/egitmen/ogrenci/${s.user.id}`} className="flex flex-col gap-3 rounded-[26px] border border-line bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-peach text-2xl">{s.user.demo ? "🧪" : "🐰"}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold">{s.user.name}</div>
                  <div className="truncate text-xs font-bold text-slate">@{s.user.username} {s.user.grade ? `· ${s.user.grade}` : ""}</div>
                </div>
                {s.profile.placementDone ? (
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${s.profile.lastActiveDay === today ? "bg-emerald-100 text-emerald-700" : "bg-bg text-slate"}`}>
                    {s.profile.lastActiveDay === today ? "Bugün aktif" : s.profile.lastActiveDay ? `Son: ${s.profile.lastActiveDay.slice(5).split("-").reverse().join(".")}` : "–"}
                  </span>
                ) : (
                  <span className="rounded-full bg-peach px-2.5 py-1 text-[11px] font-extrabold">Ölçüm bekliyor</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-bg p-3 text-center">
                <div>
                  <div className="text-[10.5px] font-bold text-muted">Başlangıç</div>
                  <div className="text-lg font-extrabold tabular-nums">{r.baselineWpm ?? "–"}</div>
                </div>
                <div>
                  <div className="text-[10.5px] font-bold text-muted">Güncel</div>
                  <div className="text-lg font-extrabold tabular-nums">{r.currentWpm ?? "–"}</div>
                </div>
                <div>
                  <div className="text-[10.5px] font-bold text-muted">Değişim</div>
                  <div className="text-lg font-extrabold tabular-nums">{fmtPct(r.wpmChange, 0)}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DOMAINS.map((d) => {
                  const v = s.domains.find((x) => x.domain === d)?.improvement;
                  return (
                    <div key={d} className="rounded-xl border border-line px-1.5 py-1.5 text-center">
                      <div className="text-[10.5px] font-bold text-muted">{DOMAIN_EMOJI[d]} {DOMAIN_SHORT[d]}</div>
                      <div className="text-sm font-extrabold tabular-nums">{fmtPct(v ?? null, 0)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate">
                <span>Bugün: {s.today.total ? `${s.today.done}/${s.today.total}` : "program açılmadı"}</span>
                <span>🔥 {s.profile.streak} gün · {s.profile.totalExercises} egzersiz</span>
              </div>
            </Link>
          );
        })}
        {!list.length && <p className="rounded-2xl bg-white p-6 font-bold text-muted">Öğrenci bulunamadı.</p>}
      </section>
      {open && <AddStudent onClose={() => setOpen(false)} onDone={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function AddStudent({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: "", username: "", password: "", grade: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          const res = await fetch("/api/teacher/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
          const d = await res.json();
          setBusy(false);
          if (!res.ok) return setErr(d.error);
          onDone();
        }}
        className="flex w-full max-w-md flex-col gap-3 rounded-[28px] bg-white p-6 shadow-lift"
        style={{ animation: "pop .25s both" }}
      >
        <h3 className="text-xl font-extrabold">Yeni öğrenci</h3>
        <p className="text-sm font-semibold text-slate">Öğrenci hesabı otomatik olarak size bağlanır. İlk girişte okuma testiyle seviyesi ölçülür.</p>
        <input required value={f.name} onChange={set("name")} placeholder="Ad Soyad" className="rounded-2xl border-2 border-line px-4 py-3 font-bold outline-none focus:border-brand" />
        <input required value={f.username} onChange={set("username")} placeholder="Kullanıcı adı (ör. ali.k)" className="rounded-2xl border-2 border-line px-4 py-3 font-bold outline-none focus:border-brand" />
        <input required minLength={6} value={f.password} onChange={set("password")} placeholder="Şifre (en az 6 karakter)" className="rounded-2xl border-2 border-line px-4 py-3 font-bold outline-none focus:border-brand" />
        <input value={f.grade} onChange={set("grade")} placeholder="Sınıf (ör. 6. sınıf) – isteğe bağlı" className="rounded-2xl border-2 border-line px-4 py-3 font-bold outline-none focus:border-brand" />
        {err && <p className="text-sm font-bold text-rose-600">{err}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-line py-3 font-extrabold">Vazgeç</button>
          <button disabled={busy} className="rounded-2xl bg-brand py-3 font-extrabold text-white disabled:opacity-60">{busy ? "Ekleniyor…" : "Ekle"}</button>
        </div>
      </form>
    </div>
  );
}
